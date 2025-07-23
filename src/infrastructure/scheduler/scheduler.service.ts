import { Injectable } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { CustomLogger, CustomLoggerWithContext } from 'src/infrastructure/logger/logger.service'
// import { SessionService } from 'src/session/session.service'


@Injectable()
export class SchedulerService {
  private readonly logger: CustomLoggerWithContext

  constructor(
    private readonly customLogger: CustomLogger,
    // private readonly sessionService: SessionService
  ) {
    this.logger = this.customLogger.withContext(SchedulerService.name)
  }

  // Каждый день в 3:00 AM
  @Cron('0 3 * * *')
  async handleCleanup() {
    this.logger.info('Running scheduled cleanup of expired tokens and sessions')
    return Promise.resolve(true)

    // try {
    //   await this.refreshTokenService.cleanupExpiredTokens()
    //   await this.sessionService.cleanupExpiredSessions()
    //   this.logger.log('Cleanup completed successfully')
    // } catch (error) {
    //   this.logger.error('Cleanup failed', error.stack)
    // }
  }
}