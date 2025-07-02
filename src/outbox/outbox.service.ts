import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { Outbox } from '@prisma/client'
import { CreateOutboxDto } from './dto/create-outbox.dto'
import { UpdateOutboxDto } from './dto/update-outbox.dto'


@Injectable()
export class OutboxService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(): Promise<Outbox[]> {
    return this.prisma.outbox.findMany()
  }

  async create(dto: CreateOutboxDto): Promise<Outbox> {
    const item = await this.prisma.outbox.create({
      data: { ...dto }
    })
    return item
  }

  async update(id: string, dto: UpdateOutboxDto): Promise<Outbox> {
    const item = await this.prisma.outbox.update({
      where: { id },
      data: { ...dto }
    })
    return item
  }

  async delete(id: string): Promise<string> {
    await this.prisma.outbox.delete({
      where: { id }
    })
    return id
  }
}
