import { Injectable } from '@nestjs/common'
import { PinoLogger } from 'nestjs-pino'


@Injectable()
export class CustomLogger {
  constructor(private readonly logger: PinoLogger) { }

  withContext(context: string) {
    return {
      log: (...args: unknown[]) => this.info({ context }, ...args),
      info: (...args: unknown[]) => this.info({ context }, ...args),
      debug: (...args: unknown[]) => this.debug({ context }, ...args),
      warn: (...args: unknown[]) => this.warn({ context }, ...args),
      error: (...args: unknown[]) => this.error({ context }, ...args)
    }
  }

  private logWithLevel(
    level: 'info' | 'debug' | 'warn' | 'error',
    ...args: unknown[]
  ): void {
    let logObject: Record<string, unknown>

    if (args.length === 0) {
      logObject = { msg: 'Empty log message' }
    } else if (typeof args[0] === 'string') {
      logObject = {
        msg: args[0],
        ...this.mergeObjects(args.slice(1))
      }
    } else {
      logObject = this.mergeObjects(args)
    }

    this.logger[level](logObject)
  }

  private mergeObjects(objects: unknown[]): Record<string, unknown> {
    return objects.reduce((acc: object, obj) => {
      if (typeof obj === 'object' && obj !== null) {
        return { ...acc, ...obj }
      }
      return acc
    }, {}) as Record<string, unknown>
  }

  log(...args: unknown[]): void {
    this.logWithLevel('info', ...args)
  }

  info(...args: unknown[]): void {
    this.logWithLevel('info', ...args)
  }

  debug(...args: unknown[]): void {
    this.logWithLevel('debug', ...args)
  }

  warn(...args: unknown[]): void {
    this.logWithLevel('warn', ...args)
  }

  error(...args: unknown[]): void {
    this.logWithLevel('error', ...args)
  }
}

export type CustomLoggerWithContext = ReturnType<CustomLogger['withContext']>
