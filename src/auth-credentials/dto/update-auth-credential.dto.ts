import { IsEmail, IsString, IsPhoneNumber, IsOptional, IsBoolean, Matches } from 'class-validator'
import { Transform, type TransformFnParams } from 'class-transformer'


export class UpdateAuthCredentialDto {
  @IsOptional()
  @IsString({ message: 'Имя пользователя должно быть строкой' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Имя пользователя может содержать только буквы, цифры и подчеркивания'
  })
  username?: string

  @Transform((params: TransformFnParams) => {
    return typeof params.value === 'string' ? params.value.toLowerCase().trim() : ''
  })
  @IsOptional()
  @IsEmail({}, { message: 'Некорректный email' })
  email?: string

  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Телефон должен быть в формате +123456789' })
  @Matches(/^\+?\d{10,15}$/, {
    message: 'Телефон должен содержать от 10 до 15 цифр, можно с + в начале'
  })
  phone?: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean
}
