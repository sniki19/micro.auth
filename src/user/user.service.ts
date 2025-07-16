import { BadRequestException, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateUserPayload } from './interfaces'


@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) { }

  async findUser(email?: string, phone?: string) {
    if (!email && !phone) {
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
    if (!email && !phone) {
      throw new BadRequestException('Некорректные данные')
    }

    const existingUser = await this.prisma.userAuthCredentials.findFirst({
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

    return !!existingUser
  }

  async createUserWithTransaction(payload: CreateUserPayload, prismaTx: Prisma.TransactionClient) {
    return prismaTx.userAuthCredentials.create({
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
