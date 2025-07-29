import { ApiProperty } from '@nestjs/swagger'
import { Transform, type TransformFnParams } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Length, Matches } from 'class-validator'
import { IsEmailOrPhone, IsMatchingPassword } from 'src/common/decorators'


export class RegisterRequest {
  @ApiProperty({
    description: 'Email address',
    example: 'user@site.com'
  })
  @Transform((params: TransformFnParams) => {
    return typeof params.value === 'string' ? params.value.toLowerCase().trim() : ''
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email' })
  email?: string

  @ApiProperty({
    description: 'Phone number',
    example: '+375291234567'
  })
  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Phone number must be in format +123456789' })
  @Matches(/^\+?\d{10,12}$/, {
    message: 'Phone number must contain 10-12 digits, may start with +'
  })
  phone?: string

  @ApiProperty({
    description: 'Password',
    example: '123qwe!@#QWE'
  })
  @IsEmailOrPhone()
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @Length(8, 32, { message: 'Password must be 8-32 characters long' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is too weak. Use letters (A-Z, a-z), numbers and special characters'
  })
  password: string

  @ApiProperty({
    description: 'Password confirmation',
    example: '123qwe!@#QWE'
  })
  @IsNotEmpty()
  @IsMatchingPassword('password')
  passwordConfirm: string
}
