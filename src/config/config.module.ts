import { Module } from '@nestjs/common'
import { ConfigModule as NestConfigModule } from '@nestjs/config'
import { envValidationSchema } from './config.schema'
import { EnvConfigService } from './config.service'


@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true
      },
      isGlobal: true
    })
  ],
  providers: [EnvConfigService],
  exports: [EnvConfigService]
})
export class ConfigModule { }
