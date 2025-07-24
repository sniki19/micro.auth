import { Injectable } from '@nestjs/common'
import * as argon2 from 'argon2'
import { EnvConfigService } from 'src/core/env-config/env-config.service'
import { CustomLogger, CustomLoggerWithContext } from 'src/infrastructure/logger/logger.service'


@Injectable()
export class PasswordService {
  private readonly logger: CustomLoggerWithContext
  private readonly ARGON2_OPTIONS: argon2.Options & { raw?: false } = {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
    hashLength: 32
  }

  constructor(
    private readonly config: EnvConfigService,
    private readonly customLogger: CustomLogger
  ) {
    this.logger = this.customLogger.withContext(PasswordService.name)

    if (this.config.ARGON_MEMORY_COST) {
      this.ARGON2_OPTIONS.memoryCost = this.config.ARGON_MEMORY_COST
    }
  }

  async hashPassword(password: string): Promise<string> {
    this.logger.debug('Starting password hashing')
    const hash = await argon2.hash(password, this.ARGON2_OPTIONS)

    this.logger.success('Password hashed successfully')
    return hash
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    this.logger.debug('Starting password comparison')
    const isMatch = await argon2.verify(hash, password)

    if (isMatch) {
      this.logger.success('Password comparison successful')
    } else {
      this.logger.error('Password comparison failed')
    }
    return isMatch
  }

  // generateResetToken(): string {
  //   this.logger.debug('Generating password reset token')
  //   const token = randomBytes(32).toString('hex')
  //   this.logger.debug('Password reset token generated')
  //   return token
  // }

  // generateResetTokenWithExpiry(expiresInHours: number): { token: string; expiresAt: Date } {
  //   this.logger.debug('Generating password reset token with expiry', { expiresInHours })
  //   const result = {
  //     token: this.generateResetToken(),
  //     expiresAt: new Date(Date.now() + expiresInHours * 3600 * 1000)
  //   }
  //   this.logger.debug('Password reset token with expiry generated', { expiresAt: result.expiresAt })
  //   return result
  // }
}
