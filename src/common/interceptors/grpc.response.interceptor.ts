import { status as GrpcStatus } from '@grpc/grpc-js'
import { CustomLogger } from '@logger/logger.service'
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { map, Observable, tap } from 'rxjs'


@Injectable()
export class GrpcResponseInterceptor implements NestInterceptor {
  constructor(private readonly logger: CustomLogger) { }

  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    const timestamp = new Date().toISOString()

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.success('GRPC Response', {
            code: GrpcStatus.OK,
            timestamp
          })
        }
      }),
      map((data: unknown) => ({
        code: GrpcStatus.OK,
        data
      }))
    )
  }
}
