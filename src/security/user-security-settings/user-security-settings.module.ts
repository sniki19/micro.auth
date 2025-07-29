import { Module } from '@nestjs/common'
import { UserSecuritySettingsService } from './user-security-settings.service'


@Module({
  providers: [UserSecuritySettingsService],
  exports: [UserSecuritySettingsService]
})
export class UserSecuritySettingsModule { }
