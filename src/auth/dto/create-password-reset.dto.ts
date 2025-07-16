import { IsNotEmpty, IsString } from 'class-validator'


export class CreatePasswordResetDto {
  @IsString()
  @IsNotEmpty()
  email: string
}
