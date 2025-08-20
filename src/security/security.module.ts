import { Module } from '@nestjs/common'
import { JwtTokenModule } from './jwt-token/jwt-token.module'
import { PasswordModule } from './password/password.module'
import { RateLimitModule } from './rate-limit/rate-limit.module'
import { RefreshTokenModule } from './refresh-token/refresh-token.module'
import { SessionModule } from './session/session.module'
import { UserSecuritySettingsModule } from './user-security-settings/user-security-settings.module'


@Module({
  imports: [
    JwtTokenModule,
    PasswordModule,
    RateLimitModule,
    RefreshTokenModule,
    SessionModule,
    UserSecuritySettingsModule
  ],
  exports: [
    JwtTokenModule,
    PasswordModule,
    RateLimitModule,
    RefreshTokenModule,
    SessionModule,
    UserSecuritySettingsModule
  ]
})
export class SecurityModule { }
