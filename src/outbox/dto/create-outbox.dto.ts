import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDateString, IsIn, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator'
import { OutboxEventType, OutboxStatus } from '../constants'


export class CreateOutboxDto {
  @ApiProperty({
    description: 'Тип события',
    enum: Object.values(OutboxEventType),
    example: OutboxEventType.USER_REGISTERED
  })
  @IsString()
  @IsIn(Object.values(OutboxEventType))
  @IsNotEmpty()
  eventType: OutboxEventType

  @ApiProperty({
    description: 'Данные события в формате JSON',
    example: { userId: '123', email: 'user@site.com' }
  })
  @IsObject()
  @IsNotEmpty()
  @Type(() => Object)
  eventData: Record<string, any>

  @ApiProperty({
    description: 'Статус обработки события',
    enum: Object.values(OutboxStatus),
    example: OutboxStatus.PENDING,
    default: OutboxStatus.PENDING
  })
  @IsString()
  @IsIn(Object.values(OutboxStatus))
  @IsOptional()
  status?: OutboxStatus = OutboxStatus.PENDING

  @ApiProperty({
    description: 'Дата обработки события',
    example: '2023-05-15T10:00:05Z',
    required: false
  })
  @IsDateString()
  @IsOptional()
  processedAt?: string | null
}
