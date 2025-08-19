import { Global, Module } from '@nestjs/common'
import { loggerProvider } from './logger.provider'
import { CustomLogger } from './logger.service'


@Global()
@Module({
  providers: [loggerProvider, CustomLogger],
  exports: [CustomLogger]
})
export class LoggerModule { }
