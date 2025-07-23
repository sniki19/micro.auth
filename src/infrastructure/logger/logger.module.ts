import { Global, Module } from '@nestjs/common'
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino'
import { loggerProvider } from './logger.provider'
import { CustomLogger } from './logger.service'


@Global()
@Module({
  imports: [
    PinoLoggerModule.forRootAsync(loggerProvider)
  ],
  providers: [CustomLogger],
  exports: [CustomLogger]
})
export class LoggerModule { }
