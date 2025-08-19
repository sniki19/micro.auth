import { CustomLogger } from '@logger/logger.service'
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import type { Request, Response } from 'express'
import { map, Observable, tap } from 'rxjs'
import { getReqHeaders, getReqIp } from '../utils'


@Injectable()
export class HttpResponseInterceptor implements NestInterceptor {
  constructor(private readonly logger: CustomLogger) { }

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const timestamp = new Date().toISOString()
    const httpContext = context.switchToHttp()
    const request = httpContext.getRequest<Request>()
    const response = httpContext.getResponse<Response>()

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.success('HTTP Response', {
            status: response.statusCode,
            request: {
              method: request.method,
              url: request.url,
              ip: getReqIp(request),
              headers: getReqHeaders(request)
            },
            timestamp
          })
        }
      }),
      map((data: unknown) => ({
        status: response.statusCode,
        data
      }))
    )
  }
}
