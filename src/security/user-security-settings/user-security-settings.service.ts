import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/infrastructure/database/prisma.service'
import { CustomLogger, CustomLoggerWithContext } from 'src/infrastructure/logger/logger.service'


@Injectable()
export class UserSecuritySettingsService {
  private readonly logger: CustomLoggerWithContext

  constructor(
    private readonly customLogger: CustomLogger,
    private readonly prisma: PrismaService
  ) {
    this.logger = this.customLogger.withContext(UserSecuritySettingsService.name)
  }

  async blockUser(userId: string, blockExpiresAt: Date, reason: string): Promise<boolean> {
    this.logger.warn('🔒 User blocked', {
      userId,
      blockExpiresAt,
      reason
    })

    const result = await this.prisma.userSecuritySettings.update({
      where: { userId },
      data: {
        accountBlocked: true,
        blockedUntil: blockExpiresAt,
        blockReason: reason
      }
    })
    return !!result
  }

  async unblockUser(userId: string): Promise<boolean> {
    this.logger.info('🔓 Unblocking user as block period has passed', {
      userId
    })

    const result = await this.prisma.userSecuritySettings.update({
      where: { userId },
      data: {
        accountBlocked: false,
        blockedUntil: null,
        blockReason: null
      }
    })
    return !!result
  }
}
