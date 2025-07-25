import * as crypto from 'node:crypto'
import { Injectable } from '@nestjs/common'
import { EnvConfigService } from 'src/core/env-config/env-config.service'
import { CustomLogger, CustomLoggerWithContext } from 'src/infrastructure/logger/logger.service'
import { FingerprintOptions } from './interfaces'


@Injectable()
export class FingerprintService {
  private readonly logger: CustomLoggerWithContext

  constructor(
    private readonly customLogger: CustomLogger,
    private readonly config: EnvConfigService
  ) {
    this.logger = this.customLogger.withContext(FingerprintService.name)
  }

  generate(options: FingerprintOptions): string {
    this.logger.info('⚡ Generating fingerprint', { ipAddress: options.ipAddress })

    const { ipAddress = '', userAgent = '' } = options
    const salt = this.config.FINGERPRINT_SALT

    const fingerprint = crypto
      .createHash('sha256')
      .update(`${ipAddress}-${userAgent}-${salt}`)
      .digest('hex')

    this.logger.success('Fingerprint generated', { fingerprint })
    return fingerprint
  }

  generateHMAC(options: FingerprintOptions): string {
    this.logger.info('⚡ Generating HMAC fingerprint', { ipAddress: options.ipAddress })

    const { ipAddress = '', userAgent = '' } = options
    const salt = this.config.FINGERPRINT_SALT

    const hmac = crypto
      .createHmac('sha256', salt)
      .update(`${ipAddress}-${userAgent}`)
      .digest('hex')

    this.logger.success('HMAC fingerprint generated', { hmac })
    return hmac
  }
}
