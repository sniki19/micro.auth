import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { AuthCredentials } from '@prisma/client'
import { getRandomString } from 'src/utils/get-random-string'
import { CreateAuthCredentialDto } from './dto/create-auth-credential.dto'
import { UpdateAuthCredentialDto } from './dto/update-auth-credential.dto'


@Injectable()
export class AuthCredentialsService {
  constructor(private readonly prisma: PrismaService) { }

  async findMany(): Promise<AuthCredentials[]> {
    return this.prisma.authCredentials.findMany()
  }

  async findById(id: string): Promise<AuthCredentials> {
    const credentials = await this.prisma.authCredentials.findFirst({
      where: {
        OR: [
          { id },
          { userId: id }
        ]
      }
    })

    if (!credentials) throw new NotFoundException('Реквизиты не найдены')

    return credentials
  }

  async create(dto: CreateAuthCredentialDto): Promise<AuthCredentials> {
    const { email, phone, password } = dto

    const credentials = await this.prisma.authCredentials.create({
      data: {
        username: this.getUserName(dto),
        email,
        phone,
        password
      }
    })
    return credentials
  }

  async update(id: string, dto: UpdateAuthCredentialDto): Promise<AuthCredentials> {
    const credentials = await this.prisma.authCredentials.update({
      where: { id },
      data: { ...dto }
    })
    return credentials
  }

  async delete(id: string): Promise<string> {
    await this.prisma.authCredentials.delete({
      where: { id }
    })
    return id
  }

  private getUserName(payload: Pick<CreateAuthCredentialDto, 'username' | 'email' | 'phone'>): string {
    if (payload.username) return payload.username
    if (payload.email) return payload.email.split('@')[0]
    if (payload.phone) return payload.phone
    return getRandomString(8)
  }
}
