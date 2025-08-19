import { Test, TestingModule } from '@nestjs/testing'
import { AppController } from '../app.controller'
import { AppService } from '../app.service'


describe('AppController', () => {
  let controller: AppController
  let service: jest.Mocked<AppService>

  const createMockService = () => ({
    getHello: jest.fn().mockReturnValue('Hello Micro.auth!')
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: createMockService()
        }
      ]
    }).compile()

    controller = module.get<AppController>(AppController)
    service = module.get(AppService)
  })

  describe('getHello()', () => {
    it('should return hello message', () => {
      const result = controller.getHello()
      expect(result).toBe('Hello Micro.auth!')
      expect(service.getHello).toHaveBeenCalled()
    })
  })
})
