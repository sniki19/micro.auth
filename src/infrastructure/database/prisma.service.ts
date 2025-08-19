import { CustomLogger } from '@logger/logger.service'
import { Injectable } from '@nestjs/common'
import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'


@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly logger: CustomLogger) {
    super()
  }

  async onModuleInit() {
    this.logger.info('🔄 Initializing database connection...')

    try {
      await this.$connect()
      this.logger.success('Database connection established successfully.')
    } catch (error: unknown) {
      this.logger.error('Failed to establish database connection.', { error })
      throw error
    }
  }

  async onModuleDestroy() {
    this.logger.info('🔻 Closing database connection...')

    try {
      await this.$disconnect()
      this.logger.success('Database connection closed successfully.')
    } catch (error: unknown) {
      this.logger.error('Error occurred while closing the database connection.', { error })
      throw error
    }
  }
}
