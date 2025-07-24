import { BadRequestException, Injectable } from '@nestjs/common'
import { TransactionOptions } from 'src/infrastructure/database/interfaces'
import { PrismaService } from 'src/infrastructure/database/prisma.service'
import { CustomLogger, CustomLoggerWithContext } from 'src/infrastructure/logger/logger.service'
import { CreateUserPayload } from './interfaces'


@Injectable()
export class UserService {
  private readonly logger: CustomLoggerWithContext

  constructor(
    private readonly customLogger: CustomLogger,
    private readonly prisma: PrismaService
  ) {
    this.logger = this.customLogger.withContext(UserService.name)
  }

  async findUser(email?: string, phone?: string) {
    this.logger.info('🔍 Searching for user', { email, phone })

    if (!email && !phone) {
      this.logger.warn('Empty search criteria provided for user')
      return null
    }

    return this.prisma.userAuthCredentials.findFirst({
      where: {
        OR: [
          { email },
          { phone }
        ]
      },
      include: {
        userSecuritySettings: true
      }
    })
  }

  async validateUserExists(email?: string, phone?: string) {
    this.logger.info('Validating user exists', { email, phone })

    if (!email && !phone) {
      this.logger.warn('Validation failed - no criteria provided')
      throw new BadRequestException('Некорректные данные')
    }

    const user = await this.prisma.userAuthCredentials.findFirst({
      where: {
        OR: [
          { email },
          { phone }
        ]
      },
      select: {
        id: true
      }
    })

    return !!user
  }

  async createUser(payload: CreateUserPayload, transactionOptions?: TransactionOptions) {
    const { email, phone } = payload
    this.logger.info('🆕👤 Creating new user', { email, phone })

    const dbClient = transactionOptions?.prismaTx || this.prisma

    return dbClient.userAuthCredentials.create({
      data: {
        ...payload,
        isActive: true,

        userSecuritySettings: {
          create: {
            loginNotifications: true
          }
        }
      }
    })
  }
}
