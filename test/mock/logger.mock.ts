import { CustomLogger } from '@logger/logger.service'


export const createLoggerMock = (): jest.Mocked<CustomLogger> => {
  const contextLogger = {
    log: jest.fn(),
    info: jest.fn(),
    success: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }

  const mockLogger = {
    withContext: jest.fn((_context: string) => {
      return contextLogger
    }),
    ...contextLogger
  } as unknown as jest.Mocked<CustomLogger>

  return mockLogger
}
