import { Transform, type TransformFnParams } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from 'class-validator'
import { IsEmailOrPhone } from 'src/common/decorators'


export class LoginRequest {
  @Transform((params: TransformFnParams) => {
    return typeof params.value === 'string' ? params.value.toLowerCase().trim() : ''
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email' })
  email?: string

  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Phone number must be in format +123456789' })
  phone?: string

  @IsEmailOrPhone()
  @IsNotEmpty({ message: 'Password cannot be empty' })
  @IsString({ message: 'Password must be a string' })
  password: string
}
