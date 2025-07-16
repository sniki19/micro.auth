import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { PinoLogger } from 'nestjs-pino'
import { ErrorHandlerService } from 'src/common/errors/error-handler.service'
import { FingerprintService } from 'src/fingerprint/fingerprint.service'
import { FingerprintOptions } from 'src/fingerprint/interfaces'
import { JwtTokenService } from 'src/jwt-token/jwt-token.service'
import { PrismaService } from 'src/prisma/prisma.service'


@Injectable()
export class SessionService {
  constructor(
    private readonly errorHandler: ErrorHandlerService,
    private readonly logger: PinoLogger,
    private readonly prisma: PrismaService,
    private readonly fingerprintService: FingerprintService,
    private readonly tokenService: JwtTokenService
  ) {
    this.logger.setContext(SessionService.name)
    this.errorHandler.setContext(SessionService.name)
  }

  async createUserSession(
    userId: string, sessionToken: string, fingerprintOptions?: FingerprintOptions
  ) {
    const expiresAt = this.tokenService.getTokenExpirationDate(sessionToken)
    if (!expiresAt) {
      throw new BadRequestException('Invalid token: unable to determine expiration date')
    }

    const fingerprint = fingerprintOptions
      ? this.fingerprintService.generateHMAC(fingerprintOptions)
      : undefined

    return this.prisma.userSession.create({
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

  async terminateSession(userId: string, sessionToken: string): Promise<boolean> {
    try {
      const result = await this.prisma.userSession.deleteMany({
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
      this.errorHandler.handleError(error, `Failed to terminate session for user ${userId}`)
      throw new InternalServerErrorException('Failed to terminate session')
    }
  }

  async terminateAllSessions(userId: string): Promise<number> {
    const result = await this.prisma.userSession.deleteMany({
      where: { userId }
    })
    this.logger.info(`Terminated ${result.count} sessions for user ${userId}`)
    return result.count
  }
}
