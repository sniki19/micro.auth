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
    this.logger.info('⚡ Creating refresh token', { userId })
    const expiresAt = this.jwtTokenService.getTokenExpirationDate(token)

    const fingerprint = fingerprintOptions
      ? this.fingerprintService.generateHMAC(fingerprintOptions)
      : undefined

    const dbClient = transactionOptions?.prismaTx || this.prisma

    try {
      const refreshToken = await dbClient.refreshToken.create({
        data: {
          userId,
          token,
          expiresAt,
          fingerprint
        }
      })

      this.logger.success('Refresh token created successfully', { userId, tokenId: refreshToken.id })
      return refreshToken
    } catch (error: unknown) {
      this.logger.error('Failed to create refresh token', { userId, error })
      throw new InternalServerErrorException('Failed to create refresh token')
    }
  }

  async getToken(userId: string, fingerprintOptions?: FingerprintOptions) {
    this.logger.info('Getting refresh token for user', { userId })

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

    if (!token) {
      this.logger.warn('Refresh token not found or invalid', { userId })
    }
    return token?.token
  }

  async validateToken(token: string): Promise<boolean> {
    this.logger.debug('🛡️ Validating refresh token')

    try {
      const { sub: userId } = this.jwtTokenService.verifyRefreshToken(token)

      const storedToken = await this.prisma.refreshToken.findFirst({
        where: {
          userId,
          token,
          isRevoked: false,
          expiresAt: { gt: new Date() }
        }
      })

      const isValid = !!storedToken
      this.logger.info('Refresh token validation result', { userId, isValid })

      return isValid
    } catch (error: unknown) {
      this.logger.warn('Refresh token validation failed', { error })
      return false
    }
  }

  async rotateToken(
    userId: string,
    oldToken: string,
    newToken: string,
    fingerprintOptions?: FingerprintOptions,
    transactionOptions?: TransactionOptions
  ) {
    this.logger.info('🔄 Rotating refresh token', { userId })
    const expiresAt = this.jwtTokenService.getTokenExpirationDate(newToken)

    const fingerprint = fingerprintOptions
      ? this.fingerprintService.generateHMAC(fingerprintOptions)
      : undefined

    const dbClient = (transactionOptions?.prismaTx || this.prisma) as Prisma.TransactionClient | PrismaService

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

    this.logger.success('Token rotated successfully', { userId })
  }

  async invalidateAllTokens(userId: string, transactionOptions?: TransactionOptions): Promise<void> {
    this.logger.info('Invalidating all refresh tokens for user', { userId })
    const dbClient = transactionOptions?.prismaTx || this.prisma

    const result = await dbClient.refreshToken.updateMany({
      where: {
        userId,
        isRevoked: false
      },
      data: {
        isRevoked: true,
        revokedAt: new Date()
      }
    })
    this.logger.info('All refresh tokens invalidated', { userId, count: result.count })
  }
}
