import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { TransactionOptions } from 'src/infrastructure/database/interfaces'
import { PrismaService } from 'src/infrastructure/database/prisma.service'
import { CustomLogger, CustomLoggerWithContext } from 'src/infrastructure/logger/logger.service'
import { FingerprintService } from 'src/security/fingerprint/fingerprint.service'
import { FingerprintOptions } from 'src/security/fingerprint/interfaces'
import { JwtTokenService } from 'src/security/jwt-token/jwt-token.service'


@Injectable()
export class RefreshTokenService {
  private readonly logger: CustomLoggerWithContext

  constructor(
    private readonly customLogger: CustomLogger,
    private readonly prisma: PrismaService,
    private readonly fingerprintService: FingerprintService,
    private readonly jwtTokenService: JwtTokenService
  ) {
    this.logger = this.customLogger.withContext(RefreshTokenService.name)
  }

  async createToken(
    userId: string,
    token: string,
    fingerprintOptions?: FingerprintOptions,
    transactionOptions?: TransactionOptions
  ) {
    const expiresAt = this.jwtTokenService.getTokenExpirationDate(token)

    const fingerprint = fingerprintOptions
      ? this.fingerprintService.generateHMAC(fingerprintOptions)
      : undefined

    const dbClient = transactionOptions?.prismaTx || this.prisma

    return dbClient.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
        fingerprint
      }
    })
  }

  async getToken(userId: string, fingerprintOptions?: FingerprintOptions) {
    const fingerprint = fingerprintOptions
      ? this.fingerprintService.generateHMAC(fingerprintOptions)
      : undefined

    const token = await this.prisma.refreshToken.findFirst({
      where: {
        userId,
        fingerprint,
        isRevoked: false,
        expiresAt: { gt: new Date() }
      }
    })

    return token?.token
  }

  async validateToken(token: string): Promise<boolean> {
    const { sub: userId } = this.jwtTokenService.verifyRefreshToken(token)

    const storedToken = await this.prisma.refreshToken.findFirst({
      where: {
        userId,
        token,
        isRevoked: false,
        expiresAt: { gt: new Date() }
      }
    })

    return !!storedToken
  }

  async rotateToken(
    userId: string,
    oldToken: string,
    newToken: string,
    fingerprintOptions?: FingerprintOptions,
    transactionOptions?: TransactionOptions
  ) {
    const expiresAt = this.jwtTokenService.getTokenExpirationDate(newToken)

    const fingerprint = fingerprintOptions
      ? this.fingerprintService.generateHMAC(fingerprintOptions)
      : undefined

    const dbClient = (transactionOptions?.prismaTx || this.prisma) as Prisma.TransactionClient | PrismaService

    try {
      if (dbClient instanceof PrismaService && '$transaction' in dbClient) {
        await dbClient.$transaction([
          dbClient.refreshToken.updateMany({
            where: {
              userId,
              token: oldToken
            },
            data: {
              isRevoked: true
            }
          }),
          dbClient.refreshToken.create({
            data: {
              userId,
              token: newToken,
              expiresAt,
              fingerprint
            }
          })
        ])
      } else {
        await Promise.all([
          dbClient.refreshToken.updateMany({
            where: {
              userId,
              token: oldToken
            },
            data: {
              isRevoked: true
            }
          }),
          dbClient.refreshToken.create({
            data: {
              userId,
              token: newToken,
              expiresAt,
              fingerprint
            }
          })
        ])
      }
    } catch (error: unknown) {
      this.logger.error('Failed to rotate tokens', { error })
      throw new InternalServerErrorException('Refresh token failed')
    }
  }

  async invalidateAllTokens(userId: string, transactionOptions?: TransactionOptions): Promise<void> {
    const dbClient = transactionOptions?.prismaTx || this.prisma

    await dbClient.refreshToken.updateMany({
      where: {
        userId,
        isRevoked: false
      },
      data: {
        isRevoked: true,
        revokedAt: new Date()
      }
    })
  }
}
