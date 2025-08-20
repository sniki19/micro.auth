import { FingerprintOptions } from '@app/security/fingerprint/interfaces'
import { ICommand } from '@nestjs/cqrs'


export class RefreshCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly oldAccessToken: string,
    public readonly fingerprintOptions?: FingerprintOptions
  ) { }
}
