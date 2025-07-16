import { Injectable } from '@nestjs/common'
import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { PinoLogger } from 'nestjs-pino'
import { AppService } from 'src/app.service'


@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly logger: PinoLogger) {
    super()
    this.logger.setContext(AppService.name)
  }

  async onModuleInit() {
    this.logger.info('🔄 Initializing database connection...')

    try {
      await this.$connect()
      this.logger.info('✅ Database connection established successfully.')
    } catch (error) {
      this.logger.error('❌ Failed to establish database connection.', error)
      throw error
    }
  }

  async onModuleDestroy() {
    this.logger.info('🔻 Closing database connection...')

    try {
      await this.$disconnect()
      this.logger.info('🟢 Database connection closed successfully.')
    } catch (error) {
      this.logger.error('⚠️ Error occurred while closing the database connection.', error)
      throw error
    }
  }
}
