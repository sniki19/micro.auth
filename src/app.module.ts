import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule } from './prisma/prisma.module'
import { AuthCredentialsModule } from './auth-credentials/auth-credentials.module'
import { OutboxModule } from './outbox/outbox.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      isGlobal: true
    }),
    PrismaModule,
    AuthCredentialsModule,
    OutboxModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule { }
