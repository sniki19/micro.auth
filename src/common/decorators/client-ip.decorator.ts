import { createParamDecorator } from '@nestjs/common'
import type { ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'


export const ClientIp = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>()

    const ip = Array.isArray(request.headers['cf-connecting-ip'])
      ? request.headers['cf-connecting-ip'][0]
      : request.headers['cf-connecting-ip'] || (
        typeof request.headers['x-forwarded-for'] === 'string'
          ? request.headers['x-forwarded-for'].split(',')[0]
          : request.ip
      )

    return ip
  }
)
