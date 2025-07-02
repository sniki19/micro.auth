import { IsString, IsNotEmpty, IsIn, IsObject, IsOptional, IsDateString } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { OutboxEventType, OutboxStatus } from '../constants'


export class CreateOutboxDto {
  @ApiProperty({
    enum: Object.values(OutboxEventType),
    example: OutboxEventType.USER_CREATED,
    description: 'Тип события'
  })
  @IsString()
  @IsIn(Object.values(OutboxEventType))
  @IsNotEmpty()
  eventType: OutboxEventType

  @ApiProperty({
    example: { userId: '123', username: 'test' },
    description: 'Данные события в формате JSON'
  })
  @IsObject()
  @IsNotEmpty()
  @Type(() => Object)
  eventData: Record<string, any>

  @ApiProperty({
    enum: Object.values(OutboxStatus),
    example: OutboxStatus.PENDING,
    description: 'Статус обработки события',
    default: OutboxStatus.PENDING
  })
  @IsString()
  @IsIn(Object.values(OutboxStatus))
  @IsOptional()
  status?: OutboxStatus = OutboxStatus.PENDING

  @ApiProperty({
    example: '2023-05-15T10:00:05Z',
    description: 'Дата обработки события',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  processedAt?: string | null
}
