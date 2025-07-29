import { Module } from '@nestjs/common'
import { OutboxModule } from 'src/infrastructure/outbox/outbox.module'
import { UserModule } from 'src/modules/user/user.module'
import { JwtTokenModule } from 'src/security/jwt-token/jwt-token.module'
import { PasswordModule } from 'src/security/password/password.module'
import { RateLimitModule } from 'src/security/rate-limit/rate-limit.module'
import { RefreshTokenModule } from 'src/security/refresh-token/refresh-token.module'
import { SessionModule } from 'src/security/session/session.module'
import { JwtStrategy } from 'src/security/strategies/jwt.strategy'
import { UserSecuritySettingsModule } from 'src/security/user-security-settings/user-security-settings.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'


@Module({
  imports: [
    UserModule,
    JwtTokenModule,
    PasswordModule,
    RateLimitModule,
    RefreshTokenModule,
    SessionModule,
    OutboxModule,
    UserSecuritySettingsModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy
  ]
})
export class AuthModule { }
