import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateOutboxDto } from './dto/create-outbox.dto'


@Injectable()
export class OutboxService {
  constructor(private readonly prisma: PrismaService) { }

  async addEvent(dto: CreateOutboxDto) {
    return this.prisma.outbox.create({
      data: dto
    })
  }

  async addEventWithTransaction(dto: CreateOutboxDto, prismaTx: Prisma.TransactionClient) {
    return prismaTx.outbox.create({
      data: dto
    })
  }

  async getPendingEvents(limit = 100) {
    return this.prisma.outbox.findMany({
      where: { status: 'PENDING' },
      take: limit,
      orderBy: { createdAt: 'asc' }
    })
  }

  async markEventAsProcessed(eventId: string) {
    return this.prisma.outbox.update({
      where: { eventId },
      data: {
        status: 'PROCESSED',
        processedAt: new Date()
      }
    })
  }

  async markEventAsFailed(eventId: string, error?: string) {
    return this.prisma.outbox.update({
      where: { eventId },
      data: {
        status: 'FAILED',
        processedAt: new Date(),
        error
      }
    })
  }
}
