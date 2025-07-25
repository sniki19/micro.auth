export type LoggerMock = {
  withContext: jest.Mock<{
    log: jest.Mock
    info: jest.Mock
    success: jest.Mock
    debug: jest.Mock
    warn: jest.Mock
    error: jest.Mock
  }, [context: string]>
  log: jest.Mock
  info: jest.Mock
  success: jest.Mock
  debug: jest.Mock
  warn: jest.Mock
  error: jest.Mock
}

export const createLoggerMock = (): LoggerMock => {
  const contextLogger = {
    log: jest.fn(),
    info: jest.fn(),
    success: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }

  const mockLogger = {
    withContext: jest.fn((context: string) => {
      console.log(`Logger context set to: ${context}`)
      return contextLogger
    }),
    ...contextLogger
  }

  return mockLogger
}
