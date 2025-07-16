import { Module } from '@nestjs/common'
import { ErrorHandlerModule } from 'src/common/errors/error.handler.module'
import { FingerprintModule } from 'src/fingerprint/fingerprint.module'
import { JwtTokenModule } from 'src/jwt-token/jwt-token.module'
import { SessionService } from './session.service'


@Module({
  imports: [
    FingerprintModule,
    JwtTokenModule,
    ErrorHandlerModule
  ],
  providers: [SessionService],
  exports: [SessionService]
})
export class SessionModule { }
