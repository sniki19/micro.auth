import { Transform, type TransformFnParams } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from 'class-validator'
import { IsEmailOrPhone } from 'src/validators'


export class LoginRequest {
  @Transform((params: TransformFnParams) => {
    return typeof params.value === 'string' ? params.value.toLowerCase().trim() : ''
  })
  @IsOptional()
  @IsEmail({}, { message: 'Некорректный email' })
  email?: string

  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Телефон должен быть в формате +123456789' })
  phone?: string

  @IsEmailOrPhone()
  @IsNotEmpty({ message: 'Пароль не должен быть пустым' })
  @IsString({ message: 'Пароль должен быть строкой' })
  password: string
}
