import { IsString, IsIn, IsOptional, IsDateString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { OutboxStatus } from '../constants'


export class UpdateOutboxDto {
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
