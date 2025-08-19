import { ConfigService } from '@nestjs/config'
import pino from 'pino'
import { LoggerToken } from './constants'
import { getPinoConfig } from './logger.config'


export const loggerProvider = {
  provide: LoggerToken,
  useFactory: (configService: ConfigService) => {
    const pinoConfig = getPinoConfig(configService)

    return pino(pinoConfig, pino.multistream(pinoConfig.streams))
  },
  inject: [ConfigService]
}
