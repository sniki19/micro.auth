import { LoggerMock } from 'test/mock/logger.mock'
import { createTestModule } from '../test/test-utils'
import { AppService } from './app.service'


describe('AppService', () => {
  let service: AppService
  let logger: LoggerMock

  beforeEach(async () => {
    const { module, loggerMock } = await createTestModule([AppService])
    service = module.get<AppService>(AppService)
    logger = loggerMock
  })

  describe('getHello', () => {
    it('should return "Hello Micro.auth!" and log message', () => {
      const result = service.getHello()

      expect(result).toBe('Hello Micro.auth!')
      expect(logger.withContext).toHaveBeenCalledWith('AppService')
      expect(logger.info).toHaveBeenCalledWith('Hello Micro.auth!')
    })
  })
})
