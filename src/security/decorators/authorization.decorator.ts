import { applyDecorators, UseGuards } from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'


export function Authorization() {
  return applyDecorators(
    UseGuards(JwtAuthGuard),
    ApiBearerAuth()
  )
}
