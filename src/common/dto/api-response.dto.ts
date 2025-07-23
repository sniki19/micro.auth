import { ApiProperty } from '@nestjs/swagger'


export class ApiResponse {
  @ApiProperty({
    description: 'Operation result status',
    example: true
  })
  success: boolean

  @ApiProperty({
    description: 'Operation result message/error',
    example: 'Result message'
  })
  message?: string
}
