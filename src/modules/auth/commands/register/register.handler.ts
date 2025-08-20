import { PrismaService } from '@app/infrastructure/database/prisma.service'
import { OutboxService } from '@app/infrastructure/outbox/outbox.service'
import { UserService } from '@app/modules/user/user.service'
import { PasswordService } from '@app/security/password/password.service'
import { CustomLogger, CustomLoggerWithContext } from '@logger/logger.service'
import { ConflictException, InternalServerErrorException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { RegisterCommand } from './register.command'


@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand, { userId: string }> {
  private readonly logger: CustomLoggerWithContext

  constructor(
    private readonly customLogger: CustomLogger,
    private readonly prisma: PrismaService,
    private readonly outboxService: OutboxService,
    private readonly passwordService: PasswordService,
    private readonly userService: UserService
  ) {
    this.logger = this.customLogger.withContext(RegisterHandler.name)
  }

  async execute(command: RegisterCommand): Promise<{ userId: string }> {
    const { email, phone, password } = command.registerDto
    this.logger.info('🪪 Starting user registration process', { email, phone })

    await this.validateUserDoesNotExist(email, phone)

    try {
      const hashedPassword = await this.passwordService.hashPassword(password)

      const user = await this.prisma.$transaction(async (prismaTx) => {
        const { userId } = await this.userService.createUser(
          {
            email,
            phone,
            password: hashedPassword
          },
          { prismaTx }
        )

        await this.outboxService.addEvent(
          {
            eventType: 'UserRegistered',
            eventData: {
              userId,
              email,
              phone
            }
          },
          { prismaTx }
        )

        return { userId }
      })

      this.logger.success('User created successfully', user)
      return user
    } catch (error: unknown) {
      this.logger.error('Registration transaction failed', { error, email, phone })
      throw new InternalServerErrorException('Registration failed')
    }
  }

  private async validateUserDoesNotExist(email?: string, phone?: string): Promise<void> {
    const userExists = await this.userService.validateUserExists(email, phone)
    if (userExists) {
      this.logger.warn('Registration attempt with existing credentials', { email, phone })
      throw new ConflictException('User already exists')
    }
  }
}
