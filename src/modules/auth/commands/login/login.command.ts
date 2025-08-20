import { FingerprintOptions } from '@app/security/fingerprint/interfaces'
import { ICommand } from '@nestjs/cqrs'
import { LoginRequest } from '../../dto'


export class LoginCommand implements ICommand {
  constructor(
    public readonly loginDto: LoginRequest,
    public readonly fingerprintOptions?: FingerprintOptions
  ) { }
}
