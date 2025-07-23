import { Injectable } from '@nestjs/common'
import { TransactionOptions } from 'src/infrastructure/database/interfaces'
import { PrismaService } from 'src/infrastructure/database/prisma.service'
import { CustomLogger, CustomLoggerWithContext } from 'src/infrastructure/logger/logger.service'
import { OutboxCreateDto } from './dto'


@Injectable()
export class OutboxService {
  private readonly logger: CustomLoggerWithContext

  constructor(
    private readonly customLogger: CustomLogger,
    private readonly prisma: PrismaService
  ) {
    this.logger = this.customLogger.withContext(OutboxService.name)
  }

  async addEvent(outboxDto: OutboxCreateDto, transactionOptions?: TransactionOptions) {
    const dbClient = transactionOptions?.prismaTx || this.prisma

    return dbClient.outbox.create({
      data: outboxDto
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
