import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule } from 'src/config/config.module'
import { JwtTokenService } from './jwt-token.service'


@Module({
  imports: [
    ConfigModule,
    JwtModule.register({
      signOptions: {
        algorithm: 'HS256'
      },
      verifyOptions: {
        algorithms: ['HS256'],
        ignoreExpiration: false
      }
    })
  ],
  providers: [JwtTokenService],
  exports: [JwtTokenService]
})
export class JwtTokenModule { }
