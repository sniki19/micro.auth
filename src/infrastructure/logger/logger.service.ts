import { Injectable } from '@nestjs/common'
import { PinoLogger } from 'nestjs-pino'


@Injectable()
export class CustomLogger {
  constructor(private readonly logger: PinoLogger) { }

  withContext(context: string) {
    return {
      log: (message: string, ...args: unknown[]) => this.log(message, ...args, { context }),
      info: (message: string, ...args: unknown[]) => this.info(message, ...args, { context }),
      success: (message: string, ...args: unknown[]) => this.success(message, ...args, { context }),
      debug: (message: string, ...args: unknown[]) => this.debug(message, ...args, { context }),
      warn: (message: string, ...args: unknown[]) => this.warn(message, ...args, { context }),
      error: (message: string, ...args: unknown[]) => this.error(message, ...args, { context })
    }
  }

  private logWithLevel(
    level: 'info' | 'debug' | 'warn' | 'error',
    ...args: unknown[]
  ): void {
    let logObject: Record<string, unknown> = {}
    let message = ''

    if (args.length > 0 && typeof args[0] === 'string') {
      message = args[0]
      args = args.slice(1)
    }

    logObject = this.mergeObjects(args)

    const orderedLogObject: Record<string, unknown> = {}

    if (logObject.context) {
      orderedLogObject.context = logObject.context
      delete logObject.context
    }

    if (message) {
      orderedLogObject.msg = message
    }

    this.logger[level]({ ...orderedLogObject, ...logObject })
  }

  private mergeObjects(objects: unknown[]): Record<string, unknown> {
    return objects.reduce((acc: Record<string, unknown>, obj) => {
      if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
        return { ...acc, ...obj }
      }
      return acc
    }, {}) as Record<string, unknown>
  }

  log(message: string, ...args: unknown[]): void {
    this.logWithLevel('info', message, ...args)
  }

  info(message: string, ...args: unknown[]): void {
    this.logWithLevel('info', message, ...args)
  }

  success(message: string, ...args: unknown[]): void {
    this.logWithLevel('info', `✅ ${message}`, ...args)
  }

  debug(message: string, ...args: unknown[]): void {
    this.logWithLevel('debug', message, ...args)
  }

  warn(message: string, ...args: unknown[]): void {
    this.logWithLevel('warn', `⚠️ ${message}`, ...args)
  }

  error(message: string, ...args: unknown[]): void {
    this.logWithLevel('error', `❌ ${message}`, ...args)
  }
}

export type CustomLoggerWithContext = ReturnType<CustomLogger['withContext']>
