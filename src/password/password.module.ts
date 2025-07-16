import { Module } from '@nestjs/common'
import { ConfigModule } from 'src/config/config.module'
import { PasswordService } from './password.service'


@Module({
  imports: [ConfigModule],
  providers: [PasswordService],
  exports: [PasswordService]
})
export class PasswordModule { }
