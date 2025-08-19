import type { Request } from 'express'


export const getReqHeaders = (request: Request) => {
  const headers = {
    ...request.headers,
    'user-agent': request.headers['user-agent'],
    authorization: request.headers.authorization ? '[REDACTED]' : undefined,
    cookie: undefined
  }
  return headers
}
