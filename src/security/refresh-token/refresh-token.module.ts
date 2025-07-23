import { Module } from '@nestjs/common'
import { FingerprintModule } from 'src/security/fingerprint/fingerprint.module'
import { JwtTokenModule } from 'src/security/jwt-token/jwt-token.module'
import { RefreshTokenService } from './refresh-token.service'


@Module({
  imports: [
    FingerprintModule,
    JwtTokenModule
  ],
  providers: [RefreshTokenService],
  exports: [RefreshTokenService]
})
export class RefreshTokenModule { }
