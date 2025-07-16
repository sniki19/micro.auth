import { Injectable, UnauthorizedException } from '@nestjs/common'
import type { CanActivate, ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'


@Injectable()
export class AuthGuardDemoTest implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>()

    const token = request.headers.authorization

    if (!token || !token.startsWith('Bearer ')) {
      throw new UnauthorizedException()
    }

    return true
  }
}
