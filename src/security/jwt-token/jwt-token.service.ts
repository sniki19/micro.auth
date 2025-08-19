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
    this.logger.info('🛡️ Verifying refresh token')
    return this.verifyToken(token, TokenType.REFRESH)
  }

  private verifyToken(token: string, type: TokenType): JwtTokenPayload {
    try {
      this.logger.log('Verifying token', { type })
      const config = this.tokenConfigs[type]
      const payload = this.jwtService.verify<JwtTokenPayload>(token, { secret: config.secret })

      this.logger.log('Token verified successfully', { userId: payload.sub })
      return payload
    } catch (error: unknown) {
      this.logger.warn('Invalid or expired token', { error })
      throw new UnauthorizedException('Invalid or expired token')
    }
  }

  generateTokens(userId: string) {
    this.logger.info('⚡ Generating tokens for user', { userId })
    const payload: JwtTokenPayload = { sub: userId }

    const tokens = {
      accessToken: this.generateToken(payload, TokenType.ACCESS),
      refreshToken: this.generateToken(payload, TokenType.REFRESH)
    }

    this.logger.success('Tokens generated successfully', { userId })
    return tokens
  }

  private generateToken(payload: JwtTokenPayload, type: TokenType): string {
    try {
      this.logger.log('Generating token', { type, payload: { sub: payload.sub } })
      const config = this.tokenConfigs[type]
      const token = this.jwtService.sign(payload, {
        ...config
      })
      this.logger.success('Token generated successfully', { type, userId: payload.sub })
      return token
    } catch (error: unknown) {
      this.logger.error('Token generation failed', { error })
      throw new UnauthorizedException('Token generation failed')
    }
  }

  getTokenExpirationDate(token: string): Date {
    this.logger.info('Getting token expiration date')
    const decoded: { exp?: number } = this.jwtService.decode(token)

    if (!decoded.exp) {
      this.logger.warn('Invalid token - no expiration date', { token })
      throw new BadRequestException('Invalid token: unable to determine expiration date')
    }
    return new Date(decoded.exp * 1000)
  }

  getTokenExpiresIn(token: string): number | null {
    try {
      this.logger.info('Getting token expires in')
      const decoded: { exp?: number } = this.jwtService.decode(token)
      if (!decoded?.exp) {
        this.logger.warn('Token has no expiration', { token })
        return null
      }

      const currentTimestamp = Math.floor(Date.now() / 1000)
      return decoded.exp - currentTimestamp
    } catch (error: unknown) {
      this.logger.warn('Failed to get token expiration', { error })
      return null
    }
  }

  isTokenExpired(token: string): boolean {
    this.logger.info('Checking if token is expired')
    const expiresIn = this.getTokenExpiresIn(token)
    return expiresIn !== null && expiresIn <= 0
  }
}
