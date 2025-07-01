import { Module } from '@nestjs/common'
import { AuthCredentialsService } from './auth-credentials.service'
import { AuthCredentialsController } from './auth-credentials.controller'


@Module({
  controllers: [AuthCredentialsController],
  providers: [AuthCredentialsService]
})
export class AuthCredentialsModule { }
