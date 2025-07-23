import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { PinoLogger } from 'nestjs-pino'
import { TransactionOptions } from 'src/infrastructure/database/interfaces'
import { PrismaService } from 'src/infrastructure/database/prisma.service'
import { FingerprintService } from 'src/security/fingerprint/fingerprint.service'
import { FingerprintOptions } from 'src/security/fingerprint/interfaces'
import { JwtTokenService } from 'src/security/jwt-token/jwt-token.service'


@Injectable()
export class SessionService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly prisma: PrismaService,
    private readonly fingerprintService: FingerprintService,
    private readonly tokenService: JwtTokenService
  ) {
    this.logger.setContext(SessionService.name)
  }

  async createUserSession(
    userId: string,
    sessionToken: string,
    fingerprintOptions?: FingerprintOptions,
    transactionOptions?: TransactionOptions
  ) {
    const expiresAt = this.tokenService.getTokenExpirationDate(sessionToken)
    if (!expiresAt) {
      throw new BadRequestException('Invalid token: unable to determine expiration date')
    }

    const fingerprint = fingerprintOptions
      ? this.fingerprintService.generateHMAC(fingerprintOptions)
      : undefined

    const dbClient = transactionOptions?.prismaTx || this.prisma

    return dbClient.userSession.create({
      data: {
        userId,
        sessionToken,
        expiresAt,
        ipAddress: fingerprintOptions?.ipAddress,
        userAgent: fingerprintOptions?.userAgent,
        fingerprint
      }
    })
  }

  async terminateSession(
    userId: string,
    sessionToken: string,
    transactionOptions?: TransactionOptions
  ): Promise<boolean> {
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

      this.logger.info(`Session terminated for user ${userId}`)
      return true
    } catch (error: unknown) {
      this.logger.error('Failed to terminate sessio', { userId, error })
      throw new InternalServerErrorException('Failed to terminate session')
    }
  }

  async terminateAllSessions(userId: string, transactionOptions?: TransactionOptions): Promise<number> {
    const dbClient = transactionOptions?.prismaTx || this.prisma

    const result = await dbClient.userSession.deleteMany({
      where: { userId }
    })
    this.logger.info(`Terminated ${result.count} sessions for user ${userId}`)
    return result.count
  }
}
