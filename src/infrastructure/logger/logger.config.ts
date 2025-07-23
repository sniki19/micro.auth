import { createWriteStream, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { ConfigService } from '@nestjs/config'
import { StreamEntry } from 'pino'
import pretty from 'pino-pretty'


export const getPinoConfig = (configService: ConfigService) => {
  const LOGS_DIR = join(process.cwd(), configService.get('LOGS_DIR', 'logs'))
  const isProduction = configService.get('NODE_ENV') === 'production'

  if (!existsSync(LOGS_DIR)) {
    mkdirSync(LOGS_DIR, { recursive: true })
  }

  const streams: StreamEntry[] = [
    {
      level: 'error',
      stream: createWriteStream(join(LOGS_DIR, 'errors.log'))
    },
    {
      level: (isProduction ? 'info' : 'debug'),
      stream: createWriteStream(join(LOGS_DIR, 'app.log'))
    },
    {
      level: 'info',
      stream: createWriteStream(join(LOGS_DIR, 'http-requests.log'))
    }
  ]

  if (!isProduction) {
    const prettyStream = pretty({
      colorize: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname',
      destination: process.stdout
    })
    streams.push({
      level: 'debug',
      stream: prettyStream
    })
  }

  const LOG_API_URL = configService.get<string>('LOG_API_URL')
  if (configService.get('LOG_TO_API') && LOG_API_URL) {
    const externalServiceStream = {
      write: (message: string) => {
        fetch(LOG_API_URL, {
          method: 'POST',
          body: message,
          headers: {
            'Content-Type': 'application/json'
          }
        }).catch(() => { })
      }
    }
    streams.push({
      level: (isProduction ? 'info' : 'debug'),
      stream: externalServiceStream
    })
  }

  return {
    level: (isProduction ? 'info' : 'debug'),
    streams
  }
}
