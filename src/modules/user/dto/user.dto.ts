import { Expose } from 'class-transformer'


export class UserDto {
  @Expose({ name: 'userId' })
  id: string

  @Expose()
  email: string

  @Expose()
  phone: string
}
