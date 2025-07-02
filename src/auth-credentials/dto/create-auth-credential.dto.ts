
import { Transform, type TransformFnParams } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsString, Matches, IsPhoneNumber, IsOptional, Length } from 'class-validator'
import { IsEmailOrPhone } from 'src/validators/email-or-phone.decorator'


export class CreateAuthCredentialDto {
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

  @IsEmailOrPhone()
  @IsNotEmpty({ message: 'Пароль не должен быть пустым' })
  @IsString({ message: 'Пароль должен быть строкой' })
  @Length(8, 32, { message: 'Пароль должен быть от 8 до 32 символов' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Пароль слишком слабый. Используйте буквы (A-Z, a-z), цифры и спецсимволы'
  })
  password: string

  @IsNotEmpty()
  @IsString()
  // @ValidateIf(o => o.password !== o.passwordСonfirm, {
  //   message: 'Пароли не совпадают'
  // })
  passwordСonfirm: string
}
