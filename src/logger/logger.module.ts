import { Module } from '@nestjs/common'
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino'
import { loggerProvider } from './logger.provider'


@Module({
  imports: [
    PinoLoggerModule.forRootAsync(loggerProvider)
  ],
  exports: [PinoLoggerModule]
})
export class LoggerModule { }
