import { ApiProperty } from '@nestjs/swagger'
import { Transform, type TransformFnParams } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Length, Matches } from 'class-validator'
import { IsEmailOrPhone, IsMatchingPassword } from 'src/common/decorators'


export class RegisterRequest {
  @ApiProperty({
    description: 'Электронный адрес',
    example: 'user@site.com'
  })
  @Transform((params: TransformFnParams) => {
    return typeof params.value === 'string' ? params.value.toLowerCase().trim() : ''
  })
  @IsOptional()
  @IsEmail({}, { message: 'Некорректный email' })
  email?: string

  @ApiProperty({
    description: 'Телефон',
    example: '+375291234567'
  })
  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Телефон должен быть в формате +123456789' })
  @Matches(/^\+?\d{10,15}$/, {
    message: 'Телефон должен содержать от 10 до 15 цифр, можно с + в начале'
  })
  phone?: string

  @ApiProperty({
    description: 'Пароль',
    example: '123qwe!@#QWE'
  })
  @IsEmailOrPhone()
  @IsNotEmpty({ message: 'Пароль обязателен для заполнения' })
  @IsString({ message: 'Пароль должен быть строкой' })
  @Length(8, 32, { message: 'Пароль должен быть от 8 до 32 символов' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Пароль слишком слабый. Используйте буквы (A-Z, a-z), цифры и спецсимволы'
  })
  password: string

  @ApiProperty({
    description: 'Подтверждение пароля',
    example: '123qwe!@#QWE'
  })
  @IsNotEmpty()
  @IsMatchingPassword('password')
  passwordConfirm: string
}
