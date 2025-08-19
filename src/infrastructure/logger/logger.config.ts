import { createWriteStream, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { ConfigService } from '@nestjs/config'
import { StreamEntry } from 'pino'
import pretty from 'pino-pretty'


export const getPinoConfig = (configService: ConfigService) => {
  const LOGS_DIR = join(process.cwd(), configService.get('LOGS_DIR', 'logs'))

  if (!existsSync(LOGS_DIR)) {
    mkdirSync(LOGS_DIR, { recursive: true })
  }

  const LOGS_FILENAME = `app-${new Date().toISOString().split('T')[0]}.log`
  const filePath = join(LOGS_DIR, LOGS_FILENAME)

  const isProduction = configService.get('NODE_ENV') === 'production'

  const streams: StreamEntry[] = [
    {
      level: isProduction ? 'info' : 'debug',
      stream: createWriteStream(filePath, { flags: 'a' })
    }
  ]

  if (!isProduction) {
    streams.push({
      level: 'debug',
      stream: pretty({
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname,context',
        destination: process.stdout
      })
    })
  }

  return {
    level: (isProduction ? 'info' : 'debug'),
    streams,
    customLevels: {
      success: 35,
      critical: 61
    },
    useOnlyCustomLevels: false,
    formatters: {
      level: (label: string) => ({ level: label })
    }
  }
}
