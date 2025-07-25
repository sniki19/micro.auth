import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { PrismaService } from 'src/infrastructure/database/prisma.service'
import { CustomLogger, CustomLoggerWithContext } from 'src/infrastructure/logger/logger.service'
import { ActionType, ServiceName } from './constants'


@Injectable()
export class RateLimitService {
  private readonly logger: CustomLoggerWithContext

  constructor(
    private readonly customLogger: CustomLogger,
    private prisma: PrismaService
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
      // Default rate limit if not configured
      // return void 0
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
      this.logger.debug('Creating new auth attempt record', { userId, ipAddress })
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
        ? new Date(now.getTime() + 30 * 60 * 1000) // 30 minutes block
        : null
      const blockReason = 'Too many failed login attempts'

      this.logger.debug('Updating existing auth attempt', {
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
        this.logger.warn('🔒 User blocked due to too many failed attempts', { userId, blockExpiresAt })
        await this.prisma.userSecuritySettings.update({
          where: { userId },
          data: {
            accountBlocked: true,
            blockedUntil: blockExpiresAt,
            blockReason: 'Too many failed login attempts'
          }
        })
      }

      return updatedAttempt
    }
  }

  // async isLoginBlocked(userId?: string, ipAddress?: string) {
  //   if (!userId && !ipAddress) return false

  //   const blockedAttempt = await this.prisma.userAuthAttempt.findFirst({
  //     where: {
  //       actionType: 'LOGIN',
  //       isBlocked: true,
  //       blockExpiresAt: { gt: new Date() },
  //       OR: [
  //         { userId },
  //         { ipAddress }
  //       ]
  //     }
  //   })

  //   return !!blockedAttempt
  // }
}
