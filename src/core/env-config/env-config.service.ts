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

  get APP_NAME() {
    return this.config.get<string>('APP_NAME', 'micro.auth')
  }

  get APP_VERSION() {
    return this.config.get<string>('APP_VERSION', '1.0.0')
  }

  get API_HOST() {
    return this.config.get<string>('API_HOST', 'localhost')
  }

  get API_PORT() {
    return this.config.get<number>('API_PORT', 3000)
  }

  get RPC_HOST() {
    return this.config.get<string>('RPC_HOST', '0.0.0.0')
  }

  get RPC_PORT() {
    return this.config.get<number>('RPC_PORT', 53000)
  }

  get DATABASE_HOST() {
    return this.config.get<string>('DATABASE_HOST', '127.0.0.1')
  }

  get DATABASE_PORT() {
    return this.config.get<number>('DATABASE_PORT', 5432)
  }

  get DATABASE_NAME() {
    return this.config.get<string>('DATABASE_NAME', 'postgres')
  }

  get DATABASE_USER() {
    return this.config.get<string>('DATABASE_USER', 'postgres')
  }

  get DATABASE_PASSWORD() {
    return this.config.get<string>('DATABASE_PASSWORD', 'postgres')
  }

  get DATABASE_URL(): string {
    const url = this.config.get<string>('DATABASE_URL')
    if (!url) throw new Error('DATABASE_URL is required')
    return url
  }

  get ARGON_MEMORY_COST() {
    return this.config.get<number>('ARGON_MEMORY_COST')
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

  get<T = any>(key: string): T | undefined {
    return this.config.get<T>(key)
  }

  private validateCoreVars() {
    const coreVars = [
      'DATABASE_URL',
      'JWT_ACCESS_TOKEN_SECRET',
      'JWT_REFRESH_TOKEN_SECRET'
    ]
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
