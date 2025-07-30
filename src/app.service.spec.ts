import { CustomLogger } from '@logger/logger.service'
import { Test, TestingModule } from '@nestjs/testing'
import { createLoggerMock } from '@test/mock/logger.mock'
import { AppService } from './app.service'


describe('AppService', () => {
  let service: AppService
  let logger: jest.Mocked<CustomLogger>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: CustomLogger,
          useValue: createLoggerMock()
        }
      ]
    }).compile()

    service = module.get<AppService>(AppService)
    logger = module.get(CustomLogger)
  })

  describe('getHello()', () => {
    it('should return "Hello Micro.auth!" and log message', () => {
      const result = service.getHello()

      expect(result).toBe('Hello Micro.auth!')
    })

    it('should log the operation', () => {
      service.getHello()
      expect(logger.withContext).toHaveBeenCalledWith(AppService.name)
      expect(logger.info).toHaveBeenCalledWith('Hello Micro.auth!')
    })
  })
})
