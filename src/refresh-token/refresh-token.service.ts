import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { PinoLogger } from 'nestjs-pino'
import { ErrorHandlerService } from 'src/common/errors/error-handler.service'
import { FingerprintService } from 'src/fingerprint/fingerprint.service'
import { FingerprintOptions } from 'src/fingerprint/interfaces'
import { JwtTokenService } from 'src/jwt-token/jwt-token.service'
import { PrismaService } from 'src/prisma/prisma.service'


@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly errorHandler: ErrorHandlerService,
    private readonly logger: PinoLogger,
    private readonly prisma: PrismaService,
    private readonly fingerprintService: FingerprintService,
    private readonly jwtTokenService: JwtTokenService
  ) {
    this.logger.setContext(RefreshTokenService.name)
    this.errorHandler.setContext(RefreshTokenService.name)
  }

  async createToken(userId: string, token: string, fingerprintOptions?: FingerprintOptions) {
    const expiresAt = this.jwtTokenService.getTokenExpirationDate(token)

    const fingerprint = fingerprintOptions
      ? this.fingerprintService.generateHMAC(fingerprintOptions)
      : undefined

    return this.prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
        fingerprint
      }
    })
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

  async rotateToken(userId: string, oldToken: string, newToken: string, fingerprintOptions?: FingerprintOptions) {
    const expiresAt = this.jwtTokenService.getTokenExpirationDate(newToken)

    const fingerprint = fingerprintOptions
      ? this.fingerprintService.generateHMAC(fingerprintOptions)
      : undefined

    try {
      return this.prisma.$transaction([
        this.prisma.refreshToken.updateMany({
          where: {
            userId,
            token: oldToken
          },
          data: {
            isRevoked: true
          }
        }),

        this.prisma.refreshToken.create({
          data: {
            userId,
            token: newToken,
            expiresAt,
            fingerprint
          }
        })
      ])
    } catch (error: unknown) {
      this.errorHandler.handleError(error, 'Failed to rotate tokens')
      throw new InternalServerErrorException('Refresh token failed')
    }
  }

  async invalidateAllTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
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
