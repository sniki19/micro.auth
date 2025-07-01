import { IsEmail, IsString, IsPhoneNumber, IsOptional, IsBoolean } from 'class-validator'
import { Transform, type TransformFnParams } from 'class-transformer'


export class UpdateAuthCredentialDto {
  @IsOptional()
  @IsString({ message: 'Имя пользователя должно быть строкой' })
  username?: string

  @Transform((params: TransformFnParams) => {
    return typeof params.value === 'string' ? params.value.toLowerCase().trim() : ''
  })
  @IsOptional()
  @IsEmail({}, { message: 'Некорректный email' })
  email?: string

  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Телефон должен быть в формате +123456789' })
  phone?: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean
}
