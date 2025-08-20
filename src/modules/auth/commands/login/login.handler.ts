import { PrismaService } from '@app/infrastructure/database/prisma.service'
import { OutboxService } from '@app/infrastructure/outbox/outbox.service'
import { UserService } from '@app/modules/user/user.service'
import { FingerprintOptions } from '@app/security/fingerprint/interfaces'
import { JwtTokenService } from '@app/security/jwt-token/jwt-token.service'
import { PasswordService } from '@app/security/password/password.service'
import { RateLimitService } from '@app/security/rate-limit/rate-limit.service'
import { RefreshTokenService } from '@app/security/refresh-token/refresh-token.service'
import { SessionService } from '@app/security/session/session.service'
import { UserSecuritySettingsService } from '@app/security/user-security-settings/user-security-settings.service'
import { CustomLogger, CustomLoggerWithContext } from '@logger/logger.service'
import { InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserAuthCredentials, UserSecuritySettings } from '@prisma/client'
import { AuthResponse, LoginRequest } from '../../dto'
import { LoginCommand } from './login.command'


@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand, AuthResponse> {
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
    private readonly userSecuritySettingsService: UserSecuritySettingsService,
    private readonly userService: UserService
  ) {
    this.logger = this.customLogger.withContext(LoginHandler.name)
  }

  async execute(command: LoginCommand): Promise<AuthResponse> {
    const { loginDto, fingerprintOptions } = command
    const { email, phone } = command.loginDto
    this.logger.info('🔑 Starting login', { email, phone }, fingerprintOptions)

    const { userId } = await this.validateUser(loginDto, fingerprintOptions)
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
          this.outboxService.addEvent({
            eventType: 'UserLoggedIn',
            eventData: {
              userId
            }
          }, { prismaTx })
        ])
      })

      this.logger.success('Login successful', { userId })
      return { accessToken }
    } catch (error) {
      this.logger.error('Login failed', error, userId, fingerprintOptions)
      throw new InternalServerErrorException('Login failed due to a database error')
    }
  }

  private async validateUser(
    loginDto: LoginRequest,
    fingerprintOptions?: FingerprintOptions
  ): Promise<UserAuthCredentials> {
    const { email, phone, password } = loginDto
    const ipAddress = fingerprintOptions?.ipAddress
    this.logger.info('Validating user credentials', { email, phone })

    const user = await this.userService.findUser(email, phone)
    if (!user) {
      this.logger.warn('User not found', { email, phone, ipAddress })
      throw new NotFoundException('User not found')
    }
    const { userId } = user

    await this.validateUserAccountStatus(user.userId, user.userSecuritySettings ?? void 0)

    const isPasswordValid = await this.passwordService.comparePassword(password, user.password)
    if (!isPasswordValid) {
      this.logger.warn('Invalid password attempt', { userId, ipAddress })
      await this.rateLimitService.trackFailedLoginAttempt(user.userId, ipAddress)
      throw new UnauthorizedException('Invalid credentials')
    }

    await this.resetFailedLoginAttempts(user.userId)

    this.logger.success('User validation successful', { userId })
    return user
  }

  private async validateUserAccountStatus(userId: string, securitySettings?: UserSecuritySettings): Promise<void> {
    if (!securitySettings) {
      this.logger.critical(`Security Settings not found for user ${userId}`)
      throw new InternalServerErrorException()
    }

    if (!securitySettings.isActive) {
      this.logger.warn('Attempt to login to deactivated account', { userId })
      throw new UnauthorizedException('Account is deactivated')
    }

    if (securitySettings.accountBlocked) {
      const now = new Date()

      if (securitySettings.blockedUntil && securitySettings.blockedUntil > now) {
        this.logger.warn('🔒 Blocked login attempt', {
          userId,
          blockedUntil: securitySettings.blockedUntil,
          blockReason: securitySettings.blockReason
        })
        throw new UnauthorizedException('Account is temporarily blocked')
      } else {
        this.logger.log('Attempt to unblock user', { userId })
        await this.userSecuritySettingsService.unblockUser(userId)
      }
    }
  }

  private async resetFailedLoginAttempts(userId: string): Promise<void> {
    try {
      await this.prisma.userSecuritySettings.update({
        where: { userId },
        data: { failedLoginAttempts: 0 }
      })
      this.logger.info('Reset failed login attempts after successful login', { userId })
    } catch (error: unknown) {
      this.logger.warn('Failed to reset login attempts', { userId, error })
    }
  }
}
