import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { envValidationSchema } from './env-config.schema'
import { EnvConfigService } from './env-config.service'


@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
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
export class EnvConfigModule { }
