import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { EnvConfigModule } from './core/env-config/env-config.module'
import { PrismaModule } from './infrastructure/database/prisma.module'
import { LoggerModule } from './infrastructure/logger/logger.module'
import { OutboxModule } from './infrastructure/outbox/outbox.module'
import { SchedulerModule } from './infrastructure/scheduler/scheduler.module'
import { AuthModule } from './modules/auth/auth.module'
import { UserModule } from './modules/user/user.module'
import { FingerprintModule } from './security/fingerprint/fingerprint.module'
import { JwtTokenModule } from './security/jwt-token/jwt-token.module'
import { SessionModule } from './security/session/session.module'
import { UserSecuritySettingsModule } from './security/user-security-settings/user-security-settings.module'


@Module({
  imports: [
    EnvConfigModule,
    LoggerModule,
    PrismaModule,
    OutboxModule,
    SchedulerModule,
    AuthModule,
    UserModule,
    FingerprintModule,
    JwtTokenModule,
    SessionModule,
    UserSecuritySettingsModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule { }
