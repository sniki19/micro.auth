import { status as GrpcStatus, Metadata } from '@grpc/grpc-js'
import { CustomLogger } from '@logger/logger.service'
import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { Observable, throwError } from 'rxjs'


interface GrpcError {
  code: number
  message: string
}

@Catch()
export class GrpcExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: CustomLogger) { }

  catch(exception: unknown, _host: ArgumentsHost): Observable<any> {
    const timestamp = new Date().toISOString()
    const error: GrpcError = {
      code: GrpcStatus.INTERNAL,
      message: 'Internal Server Error'
    }

    switch (true) {
      case exception instanceof RpcException:
        error.code = this.toRpcException(exception).code
        error.message = this.toRpcException(exception).message
        break

      case exception instanceof HttpException:
        error.code = this.mapToGrpcCode(exception)
        error.message = exception.message
        break

      case exception instanceof Error:
        error.message = exception.message ?? error.message
        break
    }

    this.logger.error('GRPC Exception', {
      code: error.code,
      error: error.message,
      timestamp,
      stack: exception instanceof Error ? exception.stack : undefined
    })

    const metadata = new Metadata()
    metadata.add('code', error.code.toString())
    metadata.add('message', error.message)
    metadata.add('timestamp', timestamp)

    return throwError(() => ({
      ...error,
      details: JSON.stringify(error),
      metadata
    }))
  }

  private toRpcException(exception: RpcException): GrpcError {
    const error = exception.getError()

    if (typeof error === 'object' && error !== null) {
      return {
        code: 'code' in error ? (error.code as number) : GrpcStatus.INTERNAL,
        message: 'message' in error ? (error.message as string) : 'Unknown error'
      }
    }

    return {
      code: GrpcStatus.INTERNAL,
      message: typeof error === 'string' ? error : 'Unknown error'
    }
  }

  private mapToGrpcCode(exception: HttpException): number {
    const status: number = exception.getStatus() || 500

    switch (status) {
      case 400: return GrpcStatus.INVALID_ARGUMENT
      case 401: return GrpcStatus.UNAUTHENTICATED
      case 403: return GrpcStatus.PERMISSION_DENIED
      case 404: return GrpcStatus.NOT_FOUND
      case 409: return GrpcStatus.ALREADY_EXISTS
      case 429: return GrpcStatus.RESOURCE_EXHAUSTED
      default: return GrpcStatus.INTERNAL
    }
  }
}
