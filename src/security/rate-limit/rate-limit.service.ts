import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { PrismaService } from 'src/infrastructure/database/prisma.service'
import { CustomLogger, CustomLoggerWithContext } from 'src/infrastructure/logger/logger.service'
import { UserSecuritySettingsService } from '../user-security-settings/user-security-settings.service'
import { ActionType, ServiceName } from './constants'


@Injectable()
export class RateLimitService {
  private readonly logger: CustomLoggerWithContext

  constructor(
    private readonly customLogger: CustomLogger,
    private readonly prisma: PrismaService,
    private readonly userSecuritySettingsService: UserSecuritySettingsService
  ) {
    this.logger = this.customLogger.withContext(RateLimitService.name)
  }

  async trackFailedLoginAttempt(userId: string, ipAddress?: string) {
    this.logger.info('Tracking failed login attempt', { userId, ipAddress })

    const rateLimit = await this.prisma.rateLimit.findFirst({
      where: { serviceName: ServiceName.AUTH_LOGIN }
    })

    if (!rateLimit) {
      this.logger.error(`Rate limit configuration not found for ${ServiceName.AUTH_LOGIN}`)
      throw new InternalServerErrorException('Service is not configured')
    }

    const now = new Date()
    const attempt = await this.prisma.userAuthAttempt.findFirst({
      where: {
        rateLimitId: rateLimit.id,
        actionType: ActionType.LOGIN,
        firstAttemptAt: {
          gte: new Date(now.getTime() - rateLimit.windowsSizeSeconds * 1000)
        },
        OR: [
          { userId },
          { ipAddress }
        ]
      },
      orderBy: { lastAttemptAt: 'desc' }
    })

    if (!attempt) {
      this.logger.info('Creating new auth attempt record', { userId, ipAddress })
      return this.prisma.userAuthAttempt.create({
        data: {
          rateLimitId: rateLimit.id,
          actionType: ActionType.LOGIN,
          userId,
          ipAddress,
          attempts: 1,
          firstAttemptAt: now,
          lastAttemptAt: now,
        }
      })
    } else {
      const isBlocked = attempt.attempts + 1 > rateLimit.maxAttempts
      const blockExpiresAt = isBlocked
        ? new Date(now.getTime() + rateLimit.blockDurationSeconds * 1000)
        : null
      const blockReason = isBlocked ? 'Too many failed login attempts' : null

      this.logger.info('Updating existing auth attempt', {
        userId,
        ipAddress,
        attempts: attempt.attempts + 1,
        isBlocked
      })

      const updatedAttempt = await this.prisma.userAuthAttempt.update({
        where: { id: attempt.id },
        data: {
          attempts: attempt.attempts + 1,
          lastAttemptAt: now,
          isBlocked,
          blockExpiresAt,
          blockReason
        }
      })

      if (isBlocked) {
        await this.userSecuritySettingsService.blockUser(userId, blockExpiresAt!, blockReason!)
      }

      return updatedAttempt
    }
  }
}
