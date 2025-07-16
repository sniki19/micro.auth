import { Injectable } from '@nestjs/common'
import * as argon2 from 'argon2'
import { EnvConfigService } from 'src/config/config.service'


@Injectable()
export class PasswordService {
  private readonly ARGON2_OPTIONS: argon2.Options & { raw?: false } = {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
    hashLength: 32
  }

  constructor(private readonly config: EnvConfigService) {
    if (this.config.ARGON_MEMORY_COST) {
      this.ARGON2_OPTIONS.memoryCost = this.config.ARGON_MEMORY_COST
    }
  }

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, this.ARGON2_OPTIONS)
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, password)
  }

  // generateResetToken(): string {
  //   return randomBytes(32).toString('hex')
  // }

  // generateResetTokenWithExpiry(expiresInHours: number): { token: string; expiresAt: Date } {
  //   return {
  //     token: this.generateResetToken(),
  //     expiresAt: new Date(Date.now() + expiresInHours * 3600 * 1000)
  //   }
  // }
}
