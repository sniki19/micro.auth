import { UserAuthCredentials } from '@prisma/client'
import { plainToInstance } from 'class-transformer'
import { UserDto } from './dto'


export const mapToUserDto = (entity: UserAuthCredentials) => {
  return plainToInstance(UserDto, entity, {
    excludeExtraneousValues: true,
    enableImplicitConversion: true
  })
}
