import { Module } from '@nestjs/common'
import { ConfigModule } from 'src/config/config.module'
import { FingerprintService } from './fingerprint.service'


@Module({
  imports: [ConfigModule],
  providers: [FingerprintService],
  exports: [FingerprintService]
})
export class FingerprintModule { }
