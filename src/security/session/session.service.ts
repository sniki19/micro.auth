import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { TransactionOptions } from 'src/infrastructure/database/interfaces'
import { PrismaService } from 'src/infrastructure/database/prisma.service'
import { CustomLogger, CustomLoggerWithContext } from 'src/infrastructure/logger/logger.service'
import { FingerprintService } from 'src/security/fingerprint/fingerprint.service'
import { FingerprintOptions } from 'src/security/fingerprint/interfaces'
import { JwtTokenService } from 'src/security/jwt-token/jwt-token.service'


@Injectable()
export class SessionService {
  private readonly logger: CustomLoggerWithContext

  constructor(
    private readonly customLogger: CustomLogger,
    private readonly prisma: PrismaService,
    private readonly fingerprintService: FingerprintService,
    private readonly tokenService: JwtTokenService
  ) {
    this.logger = this.customLogger.withContext(SessionService.name)
  }

  async createUserSession(
    userId: string,
    sessionToken: string,
    fingerprintOptions?: FingerprintOptions,
    transactionOptions?: TransactionOptions
  ) {
    this.logger.info('🆕 Creating user session', { userId })

    const expiresAt = this.tokenService.getTokenExpirationDate(sessionToken)
    if (!expiresAt) {
      this.logger.error('Invalid session token - no expiration date', { userId })
      throw new BadRequestException('Invalid token: unable to determine expiration date')
    }

    const fingerprint = fingerprintOptions
      ? this.fingerprintService.generateHMAC(fingerprintOptions)
      : undefined

    const dbClient = transactionOptions?.prismaTx || this.prisma

    try {
      const session = await dbClient.userSession.create({
        data: {
          userId,
          sessionToken,
          expiresAt,
          ipAddress: fingerprintOptions?.ipAddress,
          userAgent: fingerprintOptions?.userAgent,
          fingerprint
        }
      })

      this.logger.success('User session created successfully', {
        userId,
        sessionId: session.id
      })
      return session
    } catch (error: unknown) {
      this.logger.error('Failed to create user session', { userId, error })
      throw new InternalServerErrorException('Failed to create user session')
    }
  }

  async terminateSession(
    userId: string,
    sessionToken: string,
    transactionOptions?: TransactionOptions
  ): Promise<boolean> {
    this.logger.info('❌ Terminating user session', { userId })
    const dbClient = transactionOptions?.prismaTx || this.prisma

    try {
      const result = await dbClient.userSession.deleteMany({
        where: {
          userId,
          sessionToken,
          expiresAt: { gt: new Date() }
        }
      })

      if (result.count === 0) {
        this.logger.warn(`Session not found or already expired for user ${userId}`)
        return false
      }

      this.logger.success(`Session terminated for user ${userId}`)
      return true
    } catch (error: unknown) {
      this.logger.error('Failed to terminate session', { userId, error })
      throw new InternalServerErrorException('Failed to terminate session')
    }
  }

  async terminateAllSessions(userId: string, transactionOptions?: TransactionOptions): Promise<number> {
    this.logger.info('❌ Terminating all sessions for user', { userId })
    const dbClient = transactionOptions?.prismaTx || this.prisma

    try {
      const result = await dbClient.userSession.deleteMany({
        where: { userId }
      })

      this.logger.success('All sessions terminated', { userId, count: result.count })
      return result.count
    } catch (error: unknown) {
      this.logger.error('Failed to terminate all sessions', { userId, error })
      throw new InternalServerErrorException('Failed to terminate all sessions')
    }
  }
}
