import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendRegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
