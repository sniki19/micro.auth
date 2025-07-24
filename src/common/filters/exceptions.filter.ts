import { Catch, HttpException, HttpStatus } from '@nestjs/common'
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common'
import type { Request, Response } from 'express'
import { getReasonPhrase } from 'http-status-codes'
import { Logger } from 'nestjs-pino'


@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) { }

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp()
    const request = context.getRequest<Request>()
    const response = context.getResponse<Response>()

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR

    const message = exception instanceof HttpException
      ? exception.message
      : getReasonPhrase(HttpStatus.INTERNAL_SERVER_ERROR)

    this.logger.error(message, {
      path: request.url,
      exception
    })

    response.status(status).json({
      status,
      message,
      timestamp: new Date().toISOString()
    })
  }
}
