import { Module } from '@nestjs/common'
import { ErrorHandlerModule } from 'src/common/errors/error.handler.module'
import { JwtTokenModule } from 'src/jwt-token/jwt-token.module'
import { OutboxModule } from 'src/outbox/outbox.module'
import { PasswordModule } from 'src/password/password.module'
import { RateLimitModule } from 'src/rate-limit/rate-limit.module'
import { RefreshTokenModule } from 'src/refresh-token/refresh-token.module'
import { SessionModule } from 'src/session/session.module'
import { UserModule } from 'src/user/user.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtStrategy } from './strategies/jwt.strategy'


@Module({
  imports: [
    UserModule,
    JwtTokenModule,
    PasswordModule,
    RateLimitModule,
    RefreshTokenModule,
    SessionModule,
    OutboxModule,
    ErrorHandlerModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy
  ]
})
export class AuthModule { }
