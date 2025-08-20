import { ICommand } from '@nestjs/cqrs'
import { RegisterRequest } from '../../dto'


export class RegisterCommand implements ICommand {
  constructor(public readonly registerDto: RegisterRequest) { }
}
