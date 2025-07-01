
import { Transform, type TransformFnParams } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsString, Matches, IsPhoneNumber, IsOptional, Length } from 'class-validator'
import { IsEmailOrPhone } from 'src/validators/email-or-phone.decorator'


export class CreateAuthCredentialDto {
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

  @IsEmailOrPhone()
  @IsNotEmpty({ message: 'Пароль не должен быть пустым' })
  @IsString({ message: 'Пароль должен быть строкой' })
  @Length(8, 32, { message: 'Пароль должен быть от 8 до 32 символов' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Пароль слишком слабый. Используйте буквы (A-Z, a-z), цифры и спецсимволы'
  })
  password: string
}
