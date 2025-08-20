import { AdvancedCommandBus, ICommandBus } from '@app/infrastructure/command-bus'
import { SecurityModule } from '@app/security/security.module'
import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { OutboxModule } from 'src/infrastructure/outbox/outbox.module'
import { UserModule } from 'src/modules/user/user.module'
import { JwtStrategy } from 'src/security/strategies/jwt.strategy'
import { LoginHandler, LogoutHandler, RefreshHandler, RegisterHandler } from './commands'
import { AuthController, AuthGrpcController } from './controllers'
import { AuthService } from './services'


const services = [AuthService, JwtStrategy]
const commandHandlers = [LoginHandler, LogoutHandler, RefreshHandler, RegisterHandler]

@Module({
  imports: [
    CqrsModule,
    UserModule,
    SecurityModule,
    OutboxModule,
  ],
  controllers: [AuthController, AuthGrpcController],
  providers: [
    ...services,
    ...commandHandlers,
    {
      provide: ICommandBus,
      useClass: AdvancedCommandBus
    },
    AdvancedCommandBus
  ]
})
export class AuthModule { }
