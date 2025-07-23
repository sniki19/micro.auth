import { createParamDecorator } from '@nestjs/common'
import type { ExecutionContext } from '@nestjs/common'
import { UserAuthCredentials } from '@prisma/client'
import type { Request } from 'express'


export const Authorized = createParamDecorator(
  (data: keyof UserAuthCredentials, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>()

    const user = request.user as UserAuthCredentials

    return data ? user[data] : user
  }
)
