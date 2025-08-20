import { PrismaService } from '@app/infrastructure/database/prisma.service'
import { OutboxService } from '@app/infrastructure/outbox/outbox.service'
import { RefreshTokenService } from '@app/security/refresh-token/refresh-token.service'
import { SessionService } from '@app/security/session/session.service'
import { CustomLogger, CustomLoggerWithContext } from '@logger/logger.service'
import { InternalServerErrorException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { LogoutCommand } from './logout.command'


@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  private readonly logger: CustomLoggerWithContext

  constructor(
    private readonly customLogger: CustomLogger,
    private readonly prisma: PrismaService,
    private readonly outboxService: OutboxService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly sessionService: SessionService
  ) {
    this.logger = this.customLogger.withContext(LogoutHandler.name)
  }

  async execute(command: LogoutCommand): Promise<void> {
    const { userId, accessToken } = command
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
      this.logger.error('Logout failed', { userId, error })
      throw new InternalServerErrorException('Logout failed due to a database error')
    }
  }
}
