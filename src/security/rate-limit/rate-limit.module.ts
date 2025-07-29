import { Module } from '@nestjs/common'
import { UserSecuritySettingsModule } from '../user-security-settings/user-security-settings.module'
import { RateLimitService } from './rate-limit.service'


@Module({
  imports: [UserSecuritySettingsModule],
  providers: [RateLimitService],
  exports: [RateLimitService]
})
export class RateLimitModule { }
