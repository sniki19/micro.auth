import { Injectable } from '@nestjs/common'
import { CustomLogger, CustomLoggerWithContext } from './infrastructure/logger/logger.service'


@Injectable()
export class AppService {
  private readonly logger: CustomLoggerWithContext

  constructor(
    private readonly customLogger: CustomLogger
  ) {
    this.logger = this.customLogger.withContext(AppService.name)
  }

  getHello(): string {
    this.logger.log('Hello Micro.auth!')
    return 'Hello Micro.auth!'
  }
}
