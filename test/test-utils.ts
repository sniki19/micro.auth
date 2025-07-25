import { CustomLogger } from '@app/infrastructure/logger/logger.service'
import { Provider } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { createLoggerMock } from './mock/logger.mock'


export async function createTestModule(providers: Provider[] = []) {
  const loggerMock = createLoggerMock()

  const module = await Test.createTestingModule({
    providers: [
      ...providers,
      {
        provide: CustomLogger, useValue: loggerMock
      }
    ]
  }).compile()

  return {
    module,
    loggerMock
  }
}
