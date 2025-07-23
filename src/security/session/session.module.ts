import { Module } from '@nestjs/common'
import { FingerprintModule } from 'src/security/fingerprint/fingerprint.module'
import { JwtTokenModule } from 'src/security/jwt-token/jwt-token.module'
import { SessionService } from './session.service'


@Module({
  imports: [
    FingerprintModule,
    JwtTokenModule
  ],
  providers: [SessionService],
  exports: [SessionService]
})
export class SessionModule { }
