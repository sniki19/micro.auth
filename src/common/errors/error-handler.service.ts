import { Injectable } from '@nestjs/common'
import { PinoLogger } from 'nestjs-pino'


@Injectable()
export class ErrorHandlerService {
  constructor(private readonly logger: PinoLogger) { }

  setContext(context: string) {
    this.logger.setContext(context)
  }

  getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    if (typeof error === 'string') return error
    if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message)
    }
    return 'Unknown error occurred'
  }

  handleError(error: unknown, prefix?: string): string {
    const message = this.getErrorMessage(error)
    const beforeMessage = prefix ? `${prefix}: ` : ''

    this.logger.error(`${beforeMessage}${message}`, error instanceof Error ? error.stack : undefined)

    return message
  }
}
