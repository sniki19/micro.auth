import { Injectable, NotFoundException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { EnvConfigService } from 'src/config/config.service'
import { JwtTokenPayload } from 'src/jwt-token/interfaces'
import { PrismaService } from 'src/prisma/prisma.service'


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: EnvConfigService,
    private readonly prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.JWT_ACCESS_TOKEN_SECRET,
      algorithms: ['HS256']
    })
  }

  async validate(payload: JwtTokenPayload) {


    const user = await this.prisma.userAuthCredentials.findUnique({
      where: {
        userId: payload.sub
      }
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  // async validate(payload: any) {
  //   // Validate session is still active
  //   const session = await this.sessionsService.validateSession(payload.jti);
  //   if (!session) {
  //     return null;
  //   }

  //   // Update last activity
  //   await this.sessionsService.updateSessionActivity(session.id);

  //   return {
  //     userId: payload.sub,
  //     username: payload.username,
  //     sessionId: session.id,
  //   };
  // }
}
