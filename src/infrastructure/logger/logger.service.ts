import { Inject, Injectable } from '@nestjs/common'
import { Logger } from 'pino'
import { LoggerToken } from './constants'


type LogLevel = 'debug' | 'info' | 'success' | 'warn' | 'error' | 'critical'
type LogArgs = [message: string, ...args: unknown[]]

interface LogData {
  context?: string
  msg: string
  [key: string]: unknown
}

@Injectable()
export class CustomLogger {
  constructor(@Inject(LoggerToken) private readonly logger: Logger) { }

  withContext(context: string) {
    return {
      log: (...args: LogArgs) => this.log(...args, { context }),
      info: (...args: LogArgs) => this.info(...args, { context }),
      success: (...args: LogArgs) => this.success(...args, { context }),
      warn: (...args: LogArgs) => this.warn(...args, { context }),
      error: (...args: LogArgs) => this.error(...args, { context }),
      critical: (...args: LogArgs) => this.critical(...args, { context })
    }
  }

  log(message: string, ...args: unknown[]): void {
    this.formatLog('debug', message, ...args)
  }

  info(message: string, ...args: unknown[]): void {
    this.formatLog('info', message, ...args)
  }

  success(message: string, ...args: unknown[]): void {
    this.formatLog('success', `🗸 ${message}`, ...args)
  }

  warn(message: string, ...args: unknown[]): void {
    this.formatLog('warn', `⚠️ ${message}`, ...args)
  }

  error(message: string, ...args: unknown[]): void {
    this.formatLog('error', `❌ ${message}`, ...args)
  }

  critical(message: string, ...args: unknown[]): void {
    this.formatLog('critical', `💥 ${message}`, ...args)
  }

  private formatLog(level: LogLevel, message: string, ...args: unknown[]) {
    const merged = this.mergeObjects(args)
    const { context: ctx, ...rest } = merged
    const context = ctx as string | undefined

    const logData: LogData = {
      ...{ context },
      msg: message,
      ...rest
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.logger[level](logData)
  }

  private mergeObjects(objects: unknown[]): Record<string, unknown> {
    return objects.reduce((acc: Record<string, unknown>, obj) => {
      if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
        return { ...acc, ...obj }
      }
      return acc
    }, {}) as Record<string, unknown>
  }
}

export type CustomLoggerWithContext = ReturnType<CustomLogger['withContext']>
