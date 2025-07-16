import * as crypto from 'node:crypto'
import { Injectable } from '@nestjs/common'
import { EnvConfigService } from 'src/config/config.service'
import { FingerprintOptions } from './interfaces'


@Injectable()
export class FingerprintService {
  constructor(private readonly config: EnvConfigService) { }

  generate(options: FingerprintOptions): string {
    const { ipAddress = '', userAgent = '' } = options
    const salt = this.config.FINGERPRINT_SALT

    return crypto
      .createHash('sha256')
      .update(`${ipAddress}-${userAgent}-${salt}`)
      .digest('hex')
  }

  generateHMAC(options: FingerprintOptions): string {
    const { ipAddress = '', userAgent = '' } = options
    const salt = this.config.FINGERPRINT_SALT

    return crypto
      .createHmac('sha256', salt)
      .update(`${ipAddress}-${userAgent}`)
      .digest('hex')
  }
}
