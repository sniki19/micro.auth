import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common'
import { UserAuthCredentials } from '@prisma/client'
import { PrismaService } from 'src/infrastructure/database/prisma.service'
import { CustomLogger, CustomLoggerWithContext } from 'src/infrastructure/logger/logger.service'
import { OutboxService } from 'src/infrastructure/outbox/outbox.service'
import { UserService } from 'src/modules/user/user.service'
import { FingerprintOptions } from 'src/security/fingerprint/interfaces'
import { JwtTokenService } from 'src/security/jwt-token/jwt-token.service'
import { PasswordService } from 'src/security/password/password.service'
import { RateLimitService } from 'src/security/rate-limit/rate-limit.service'
import { RefreshTokenService } from 'src/security/refresh-token/refresh-token.service'
import { SessionService } from 'src/security/session/session.service'
import { AuthResponse, LoginRequest, RegisterRequest } from './dto'


@Injectable()
export class AuthService {
  private readonly logger: CustomLoggerWithContext

  constructor(
    private readonly customLogger: CustomLogger,
    private readonly prisma: PrismaService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly outboxService: OutboxService,
    private readonly passwordService: PasswordService,
    private readonly rateLimitService: RateLimitService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly sessionService: SessionService,
    private readonly userService: UserService
  ) {
    this.logger = this.customLogger.withContext(AuthService.name)
  }

  async register(registerDto: RegisterRequest): Promise<Pick<UserAuthCredentials, 'userId'>> {
    const { email, phone, password } = registerDto
    this.logger.info('🪪 Starting user registration process', { email, phone })

    const allowToCreateNewUserWithCredentials = !(await this.userService.validateUserExists(email, phone))
    if (!allowToCreateNewUserWithCredentials) {
      this.logger.warn('Registration attempt with existing credentials', { email, phone })
      throw new ConflictException('User already exists')
    }

    try {
      const hashedPassword = await this.passwordService.hashPassword(password)

      return await this.prisma.$transaction(async (prismaTx) => {
        const { userId } = await this.userService.createUser(
          {
            email,
            phone,
            password: hashedPassword
          },
          { prismaTx }
        )

        await this.outboxService.addEvent(
          {
            eventType: 'UserRegistered',
            eventData: {
              userId,
              email,
              phone
            }
          },
          { prismaTx }
        )

        return { userId }
      })
    } catch (error: unknown) {
      this.logger.error('Registration transaction failed', { error, email, phone })
      throw new InternalServerErrorException('Registration failed')
    }
  }

  async login(loginDto: LoginRequest, fingerprintOptions?: FingerprintOptions): Promise<AuthResponse> {
    const { email, phone } = loginDto
    this.logger.info('🔑 Starting login', { email, phone }, fingerprintOptions)

    const { userId } = await this.validateUser(loginDto)
    this.logger.success('User validated successfully', { userId })

    const { accessToken, refreshToken } = this.jwtTokenService.generateTokens(userId)

    try {
      await this.prisma.$transaction(async (prismaTx) => {
        await Promise.all([
          this.refreshTokenService.createToken(
            userId,
            refreshToken,
            fingerprintOptions,
            { prismaTx }
          ),
          this.sessionService.createUserSession(
            userId,
            accessToken,
            fingerprintOptions,
            { prismaTx }
          ),
          this.outboxService.addEvent(
            {
              eventType: 'UserLoggedIn',
              eventData: {
                userId
              }
            },
            { prismaTx }
          )
        ])
      })

      this.logger.success('Login successful', { userId })
      return { accessToken }
    } catch (error: unknown) {
      this.logger.error('Login transaction failed', { error, userId, fingerprintOptions })
      throw new InternalServerErrorException('Login failed due to a database error')
    }
  }

  async logout(userId: string, accessToken: string): Promise<void> {
    this.logger.info('🔒 Starting logout process', { userId })

    try {
      await this.prisma.$transaction(async (prismaTx) => {
        await Promise.all([
          this.sessionService.terminateSession(
            userId,
            accessToken,
            { prismaTx }
          ),
          this.refreshTokenService.invalidateAllTokens(
            userId,
            { prismaTx }
          ),
          this.outboxService.addEvent(
            {
              eventType: 'UserLoggedOut',
              eventData: {
                userId
              }
            },
            { prismaTx }
          )
        ])
      })

      this.logger.success('Logout successful', { userId })
    } catch (error: unknown) {
      this.logger.error('Logout transaction failed', { userId, error })
      throw new InternalServerErrorException('Logout failed due to a database error')
    }
  }

  async refresh(
    userId: string,
    accessToken: string,
    fingerprintOptions?: FingerprintOptions
  ): Promise<AuthResponse> {
    this.logger.info('🔄 Token refresh requested', { userId })

    const refreshToken = await this.refreshTokenService.getToken(userId, fingerprintOptions)
    if (!refreshToken) {
      this.logger.warn('Invalid refresh token attempt', { userId })
      throw new UnauthorizedException('Invalid refresh token')
    }

    const tokens = this.jwtTokenService.generateTokens(refreshToken)

    await this.refreshTokenService.rotateToken(userId, refreshToken, tokens.refreshToken, fingerprintOptions)
    this.logger.success('Token refreshed successfully', { userId })

    return { accessToken }
  }

  private async validateUser(loginDto: LoginRequest, ipAddress?: string): Promise<UserAuthCredentials> {
    const { email, phone, password } = loginDto
    this.logger.info('Validating user credentials', { email, phone })

    const user = await this.userService.findUser(email, phone)
    if (!user) {
      this.logger.warn('User not found', { email, phone, ipAddress })
      throw new NotFoundException('User not found')
    }

    if (!user.isActive) {
      this.logger.warn('Attempt to login to deactivated account', { userId: user.userId })
      throw new UnauthorizedException('Account is deactivated')
    }

    if (user.userSecuritySettings?.accountBlocked) {
      const now = new Date()

      if (user.userSecuritySettings.blockedUntil && user.userSecuritySettings.blockedUntil > now) {
        this.logger.warn('🔒 Blocked login attempt', {
          userId: user.userId,
          blockedUntil: user.userSecuritySettings.blockedUntil,
          blockReason: user.userSecuritySettings.blockReason
        })
        throw new UnauthorizedException('Account is temporarily blocked')
      } else {
        this.logger.info('🔓 Unblocking user as block period has passed', { userId: user.userId })
        await this.prisma.userSecuritySettings.update({
          where: { userId: user.userId },
          data: {
            accountBlocked: false,
            blockedUntil: null,
            blockReason: null
          }
        })
      }
    }

    const isPasswordValid = await this.passwordService.comparePassword(password, user.password)
    if (!isPasswordValid) {
      this.logger.warn('Invalid password attempt', { userId: user.userId, ipAddress })
      await this.rateLimitService.trackFailedLoginAttempt(user.userId, ipAddress)
      throw new UnauthorizedException('Invalid credentials')
    }

    // Reset failed attempts on successful login
    if (user.userSecuritySettings?.failedLoginAttempts ?? 0 > 0) {
      this.logger.info('Resetting failed login attempts after successful login', { userId: user.userId })
      await this.prisma.userSecuritySettings.update({
        where: { userId: user.userId },
        data: { failedLoginAttempts: 0 }
      })
    }

    this.logger.success('User validation successful', { userId: user.userId })
    return user
  }
}
