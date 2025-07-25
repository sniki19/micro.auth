import { Provider } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { CustomLogger } from '../src/infrastructure/logger/logger.service'
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
