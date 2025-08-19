import { CustomLogger } from '@logger/logger.service'
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import type { Request, Response } from 'express'
import { getReasonPhrase } from 'http-status-codes'
import { getReqHeaders, getReqIp } from '../utils'


interface HttpError {
  status: number
  message: string
}

@Catch()
export class HttpExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: CustomLogger) { }

  catch(exception: unknown, host: ArgumentsHost) {
    const timestamp = new Date().toISOString()
    const context = host.switchToHttp()
    const request = context.getRequest<Request>()
    const response = context.getResponse<Response>()
    const error: HttpError = {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: getReasonPhrase(HttpStatus.INTERNAL_SERVER_ERROR)
    }

    switch (true) {
      case exception instanceof HttpException:
        error.status = exception.getStatus()
        error.message = exception.message
        break

      case exception instanceof Error:
        error.message = exception.message ?? error.message
        break
    }

    this.logger.error('HTTP Exception', {
      status: error.status,
      error: error.message,
      request: {
        method: request.method,
        url: request.url,
        ip: getReqIp(request),
        headers: getReqHeaders(request)
      },
      timestamp,
      stack: exception instanceof Error ? exception.stack : undefined
    })

    response.status(error.status).json({
      ...error,
      timestamp
    })
  }
}
