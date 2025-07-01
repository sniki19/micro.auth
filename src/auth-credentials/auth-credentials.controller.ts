import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { AuthCredentialsService } from './auth-credentials.service'
import { CreateAuthCredentialDto } from './dto/create-auth-credential.dto'
import { UpdateAuthCredentialDto } from './dto/update-auth-credential.dto'


@Controller('auth-credentials')
export class AuthCredentialsController {
  constructor(private readonly authCredentialsService: AuthCredentialsService) { }

  @Get()
  findMany() {
    return this.authCredentialsService.findMany()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authCredentialsService.findById(id)
  }

  @Post()
  create(@Body() dto: CreateAuthCredentialDto) {
    return this.authCredentialsService.create(dto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthCredentialDto: UpdateAuthCredentialDto) {
    return this.authCredentialsService.update(id, updateAuthCredentialDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authCredentialsService.delete(id)
  }
}
