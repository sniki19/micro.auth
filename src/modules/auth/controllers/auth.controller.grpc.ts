import { CustomLogger, CustomLoggerWithContext } from '@logger/logger.service'
import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'


@Controller('auth-grpc')
export class AuthGrpcController {
  private readonly logger: CustomLoggerWithContext

  constructor(
    private readonly customLogger: CustomLogger
  ) {
    this.logger = this.customLogger.withContext(AuthGrpcController.name)
  }

  @GrpcMethod('AuthService', 'register')
  async register(): Promise<void> {
    this.logger.info('Registering new user VOID')
    return Promise.resolve(void 0)
  }
}
