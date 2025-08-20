import { ICommandBus } from '@app/infrastructure/command-bus'
import { Injectable } from '@nestjs/common'
import { FingerprintOptions } from 'src/security/fingerprint/interfaces'
import { LoginCommand, LogoutCommand, RefreshCommand, RegisterCommand } from '../commands'
import { AuthResponse, LoginRequest, RegisterRequest } from '../dto'


@Injectable()
export class AuthService {
  constructor(private readonly commandBus: ICommandBus) { }

  async register(registerDto: RegisterRequest): Promise<{ userId: string }> {
    const command = new RegisterCommand(registerDto)
    return this.commandBus.execute(command)

    // this.commandBus.dispatch(new SendWelcomeEmailCommand(result.userId, registerDto.email))
    // this.commandBus.dispatch(new CreateUserProfileCommand(result.userId))
    // this.commandBus.dispatch(new UpdateAnalyticsCommand('user_registered'))
  }

  async login(loginDto: LoginRequest, fingerprintOptions?: FingerprintOptions): Promise<AuthResponse> {
    const command = new LoginCommand(loginDto, fingerprintOptions)
    return this.commandBus.execute(command)
  }

  async logout(userId: string, accessToken: string): Promise<void> {
    const command = new LogoutCommand(userId, accessToken)
    return this.commandBus.execute(command)
  }

  async refresh(
    userId: string,
    oldAccessToken: string,
    fingerprintOptions?: FingerprintOptions
  ): Promise<AuthResponse> {
    const command = new RefreshCommand(userId, oldAccessToken, fingerprintOptions)
    return this.commandBus.execute(command)
  }
}
