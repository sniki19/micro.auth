import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { Request } from 'express'


export const BearerToken = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>()
    const authorization = request.headers.authorization

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException()
    }

    const [, token] = authorization.split(' ')
    return token
  }
)
