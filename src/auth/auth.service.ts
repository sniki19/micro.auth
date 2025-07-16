import {
  ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException
} from '@nestjs/common'
import { UserAuthCredentials } from '@prisma/client'
import { PinoLogger } from 'nestjs-pino'
import { ErrorHandlerService } from 'src/common/errors/error-handler.service'
import { FingerprintOptions } from 'src/fingerprint/interfaces'
import { JwtTokenService } from 'src/jwt-token/jwt-token.service'
import { OutboxService } from 'src/outbox/outbox.service'
import { PasswordService } from 'src/password/password.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { RateLimitService } from 'src/rate-limit/rate-limit.service'
import { RefreshTokenService } from 'src/refresh-token/refresh-token.service'
import { SessionService } from 'src/session/session.service'
import { mapToUserDto } from 'src/user/user.mapper'
import { UserService } from 'src/user/user.service'
import { LoginRequest, RegisterRequest } from './dto'


@Injectable()
export class AuthService {
  constructor(
    private readonly errorHandler: ErrorHandlerService,
    private readonly logger: PinoLogger,
    private readonly prisma: PrismaService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly outboxService: OutboxService,
    private readonly passwordService: PasswordService,
    private readonly rateLimitService: RateLimitService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly sessionService: SessionService,
    private readonly userService: UserService
  ) {
    this.logger.setContext(AuthService.name)
    this.errorHandler.setContext(AuthService.name)
  }

  async register(registerDto: RegisterRequest) {
    const { email, phone, password } = registerDto

    const allowToCreateNewUserWithCredentials = !(await this.userService.validateUserExists(email, phone))
    if (!allowToCreateNewUserWithCredentials) {
      throw new ConflictException('User is already registered')
    }

    const hashedPassword = await this.passwordService.hashPassword(password)

    try {
      return this.prisma.$transaction(async (tx) => {
        const user = await this.userService.createUserWithTransaction({
          email,
          phone,
          password: hashedPassword
        }, tx)

        await this.outboxService.addEventWithTransaction({
          eventType: 'UserRegistered',
          eventData: {
            userId: user.userId,
            email,
            phone
          }
        }, tx)

        return mapToUserDto(user)
      })
    } catch (error: unknown) {
      this.errorHandler.handleError(error, `Failed to register user`)
      throw new InternalServerErrorException('Registration failed')
    }
  }

  async login(loginDto: LoginRequest, fingerprintOptions?: FingerprintOptions) {
    const user = await this.validateUser(loginDto)

    const { accessToken, refreshToken } = this.jwtTokenService.generateTokens(user.userId)

    await this.refreshTokenService.createToken(user.userId, refreshToken, fingerprintOptions)

    await this.sessionService.createUserSession(user.userId, accessToken, fingerprintOptions)

    return {
      accessToken,
      refreshToken
    }
  }

  async refresh(refreshToken: string, fingerprintOptions?: FingerprintOptions) {
    const isValid = await this.refreshTokenService.validateToken(refreshToken)
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    const { sub: userId } = this.jwtTokenService.verifyRefreshToken(refreshToken)
    const tokens = this.jwtTokenService.generateTokens(refreshToken)

    await this.refreshTokenService.rotateToken(userId, refreshToken, tokens.refreshToken, fingerprintOptions)

    return tokens
  }

  async logout(userId: string, accessToken: string) {
    await this.sessionService.terminateSession(userId, accessToken)
    await this.refreshTokenService.invalidateAllTokens(userId)

    return {
      success: true
    }
  }

  private async validateUser(loginDto: LoginRequest, ipAddress?: string): Promise<UserAuthCredentials> {
    const { email, phone, password } = loginDto

    const user = await this.userService.findUser(email, phone)
    if (!user) {
      throw new NotFoundException('User not found')
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated')
    }

    // Check if account is blocked
    if (user.userSecuritySettings?.accountBlocked) {
      const now = new Date()

      if (user.userSecuritySettings.blockedUntil && user.userSecuritySettings.blockedUntil > now) {
        this.logger.warn(`Blocked login attempt for user ${user.userId}`)
        throw new UnauthorizedException('Account is temporarily blocked')
      } else {
        // Unblock if block time has passed
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
      await this.rateLimitService.trackFailedLoginAttempt(user.userId, ipAddress)
      this.logger.warn(`Failed login attempt for user ${user.userId} from IP ${ipAddress}`)
      throw new UnauthorizedException('Invalid credentials')
    }

    // Reset failed attempts on successful login
    if (user.userSecuritySettings?.failedLoginAttempts ?? 0 > 0) {
      await this.prisma.userSecuritySettings.update({
        where: { userId: user.userId },
        data: { failedLoginAttempts: 0 }
      })
    }

    return user
  }
}
