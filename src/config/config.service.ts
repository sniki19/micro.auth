import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { type Environment } from './constants'


@Injectable()
export class EnvConfigService implements OnModuleInit {
  constructor(private readonly config: ConfigService) { }

  onModuleInit() {
    this.validateCoreVars()
    this.validateProductionVars()
  }

  get NODE_ENV() {
    return this.config.get<Environment>('NODE_ENV', 'production')
  }

  get MODE() {
    const NODE_ENV = this.NODE_ENV
    return {
      IS_DEVELOPMENT: NODE_ENV === 'development',
      IS_PRODUCTION: NODE_ENV === 'production'
    }
  }

  get API_PORT() {
    return this.config.get<number>('API_PORT', 3000)
  }

  get FINGERPRINT_SALT() {
    return this.config.get<string>('FINGERPRINT_SALT', '')
  }

  get JWT_ACCESS_TOKEN_SECRET() {
    return this.config.get<string>('JWT_ACCESS_TOKEN_SECRET')!
  }

  get JWT_ACCESS_TOKEN_TTL() {
    return this.config.get<string>('JWT_ACCESS_TOKEN_TTL', '15m')
  }

  get JWT_REFRESH_TOKEN_SECRET() {
    return this.config.get<string>('JWT_REFRESH_TOKEN_SECRET')!
  }

  get JWT_REFRESH_TOKEN_TTL() {
    return this.config.get<string>('JWT_REFRESH_TOKEN_TTL', '1d')
  }

  get DATABASE_URL(): string {
    return this.config.get<string>('DATABASE_URL')!
  }

  get ARGON_MEMORY_COST() {
    return this.config.get<number>('ARGON_MEMORY_COST')
  }

  get<T = any>(key: string): T | undefined {
    return this.config.get<T>(key)
  }

  private validateCoreVars() {
    const coreVars = ['DATABASE_URL', 'JWT_ACCESS_TOKEN_SECRET', 'JWT_REFRESH_TOKEN_SECRET']
    const optionalVars = []

    const missingCoreVars = coreVars.filter(key => !this.config.get(key))
    if (missingCoreVars.length > 0) {
      throw new Error(`Missing critical ENV vars: ${missingCoreVars.join(', ')}.`)
    }

    const missingOptionalVars = optionalVars.filter(key => !this.config.get(key))
    if (missingOptionalVars.length > 0) {
      console.warn(`Missing ENV vars: ${missingOptionalVars.join(', ')}. Some logic can be disabled.`)
    }
  }

  private validateProductionVars() {
    if (!this.MODE.IS_PRODUCTION) return

    if (this.JWT_ACCESS_TOKEN_SECRET.length < 32) {
      throw new Error('JWT_ACCESS_TOKEN_SECRET must be at least 32 chars in production!')
    }

    if (this.JWT_REFRESH_TOKEN_SECRET.length < 32) {
      throw new Error('JWT_REFRESH_TOKEN_SECRET must be at least 32 chars in production!')
    }
  }
}
