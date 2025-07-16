import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { ConfigModule } from './config/config.module'
import { FingerprintModule } from './fingerprint/fingerprint.module'
import { JwtTokenModule } from './jwt-token/jwt-token.module'
import { LoggerModule } from './logger/logger.module'
import { PrismaModule } from './prisma/prisma.module'
import { SessionModule } from './session/session.module'
import { SchedulerModule } from './tasks/scheduler/scheduler.module'
import { UserModule } from './user/user.module'


@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    PrismaModule,
    AuthModule,
    JwtTokenModule,
    SessionModule,
    UserModule,
    FingerprintModule,
    SchedulerModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule { }
