import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { EnvConfigService } from 'src/core/env-config/env-config.service'
import { CustomLogger, CustomLoggerWithContext } from 'src/infrastructure/logger/logger.service'
import { TokenType } from './constants'
import { JwtTokenPayload, TokenConfig } from './interfaces'


@Injectable()
export class JwtTokenService {
  private readonly logger: CustomLoggerWithContext
  private readonly tokenConfigs: Record<TokenType, TokenConfig>

  constructor(
    private readonly customLogger: CustomLogger,
    private readonly config: EnvConfigService,
    private readonly jwtService: JwtService
  ) {
    this.logger = this.customLogger.withContext(JwtTokenService.name)
    this.tokenConfigs = {
      [TokenType.ACCESS]: {
        secret: this.config.JWT_ACCESS_TOKEN_SECRET,
        expiresIn: this.config.JWT_ACCESS_TOKEN_TTL
      },
      [TokenType.REFRESH]: {
        secret: this.config.JWT_REFRESH_TOKEN_SECRET,
        expiresIn: this.config.JWT_REFRESH_TOKEN_TTL
      }
    }
  }

  verifyRefreshToken(token: string) {
    return this.verifyToken(token, TokenType.REFRESH)
  }

  private verifyToken(token: string, type: TokenType): JwtTokenPayload {
    try {
      const config = this.tokenConfigs[type]
      return this.jwtService.verify(token, { secret: config.secret })
    } catch (error: unknown) {
      this.logger.info(`Invalid or expired token: ${error instanceof Error ? error.message : String(error)}`)
      throw new UnauthorizedException('Invalid or expired token')
    }
  }

  generateTokens(userId: string) {
    const payload: JwtTokenPayload = { sub: userId }

    return {
      accessToken: this.generateToken(payload, TokenType.ACCESS),
      refreshToken: this.generateToken(payload, TokenType.REFRESH)
    }
  }

  private generateToken(payload: JwtTokenPayload, type: TokenType): string {
    try {
      const config = this.tokenConfigs[type]
      return this.jwtService.sign(payload, {
        ...config
      })
    } catch (error: unknown) {
      this.logger.info(`Token generation failed: ${error instanceof Error ? error.message : String(error)}`)
      throw new UnauthorizedException('Token generation failed')
    }
  }

  getTokenExpirationDate(token: string): Date {
    const decoded: { exp?: number } = this.jwtService.decode(token)

    if (!decoded.exp) {
      throw new BadRequestException('Invalid token: unable to determine expiration date')
    }
    return new Date(decoded.exp * 1000)
  }

  getTokenExpiresIn(token: string): number | null {
    try {
      const decoded: { exp?: number } = this.jwtService.decode(token)
      if (!decoded?.exp) {
        return null
      }

      const currentTimestamp = Math.floor(Date.now() / 1000)
      return decoded.exp - currentTimestamp
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return null
    }
  }

  isTokenExpired(token: string): boolean {
    const expiresIn = this.getTokenExpiresIn(token)
    return expiresIn !== null && expiresIn <= 0
  }
}
