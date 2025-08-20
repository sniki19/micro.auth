import { PrismaService } from '@app/infrastructure/database/prisma.service'
import { OutboxService } from '@app/infrastructure/outbox/outbox.service'
import { FingerprintOptions } from '@app/security/fingerprint/interfaces'
import { JwtTokenService } from '@app/security/jwt-token/jwt-token.service'
import { RefreshTokenService } from '@app/security/refresh-token/refresh-token.service'
import { SessionService } from '@app/security/session/session.service'
import { CustomLogger, CustomLoggerWithContext } from '@logger/logger.service'
import { InternalServerErrorException, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { AuthResponse } from '../../dto'
import { RefreshCommand } from './refresh.command'


@CommandHandler(RefreshCommand)
export class RefreshHandler implements ICommandHandler<RefreshCommand, AuthResponse> {
  private readonly logger: CustomLoggerWithContext

  constructor(
    private readonly customLogger: CustomLogger,
    private readonly prisma: PrismaService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly outboxService: OutboxService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly sessionService: SessionService
  ) {
    this.logger = this.customLogger.withContext(RefreshHandler.name)
  }

  async execute(command: RefreshCommand): Promise<AuthResponse> {
    const { userId, oldAccessToken, fingerprintOptions } = command
    this.logger.info('🔄 Token refresh requested', { userId })

    await this.validateSession(userId, oldAccessToken)

    const storedRefreshToken = await this.validateRefreshToken(userId, fingerprintOptions)
    const { accessToken, refreshToken } = this.jwtTokenService.generateTokens(userId)

    try {
      await this.prisma.$transaction(async (prismaTx) => {
        await Promise.all([
          this.refreshTokenService.rotateToken(
            userId,
            storedRefreshToken.token,
            refreshToken,
            fingerprintOptions,
            { prismaTx }
          ),

          this.sessionService.updateSessionToken(
            userId,
            oldAccessToken,
            accessToken,
            { prismaTx }
          ),

          this.outboxService.addEvent({
            eventType: 'TokensRefreshed',
            eventData: {
              userId,
              oldAccessToken: oldAccessToken.slice(-8),
              newAccessToken: accessToken.slice(-8)
            }
          }, { prismaTx })
        ])
      })

      this.logger.success('Token refreshed successfully', { userId })
      return { accessToken }
    } catch (error: unknown) {
      this.logger.error('Refresh failed', { userId, error })
      throw new InternalServerErrorException('Refresh failed due to a database error')
    }
  }

  private async validateSession(userId: string, accessToken: string): Promise<void> {
    const isValidSession = await this.sessionService.validateSession(userId, accessToken)
    if (!isValidSession) {
      this.logger.warn('Invalid session', { userId })
      throw new UnauthorizedException('Invalid session')
    }
  }

  private async validateRefreshToken(userId: string, fingerprintOptions?: FingerprintOptions) {
    const storedRefreshToken = await this.refreshTokenService.findTokenRecord(userId, fingerprintOptions)
    if (!storedRefreshToken) {
      this.logger.warn('Invalid refresh token attempt', { userId })
      throw new UnauthorizedException('Invalid refresh token')
    }
    return storedRefreshToken
  }
}
