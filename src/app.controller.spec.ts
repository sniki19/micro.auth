import { createTestModule } from '../test/test-utils'
import { AppController } from './app.controller'
import { AppService } from './app.service'


describe('AppController', () => {
  let controller: AppController
  let appService: { getHello: jest.Mock<string, []> }

  beforeEach(async () => {
    const { module } = await createTestModule([
      AppController,
      {
        provide: AppService,
        useValue: {
          getHello: jest.fn().mockReturnValue('Hello Micro.auth!')
        }
      }
    ])

    controller = module.get<AppController>(AppController)
    appService = module.get(AppService)
  })

  describe('getHello', () => {
    it('should return "Hello Micro.auth!"', () => {
      const result = controller.getHello()

      expect(result).toBe('Hello Micro.auth!')
      expect(appService.getHello).toHaveBeenCalled()
    })
  })
})
