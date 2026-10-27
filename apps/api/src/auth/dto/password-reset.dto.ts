import { IsEmail, IsString, MinLength, IsOptional, IsIn } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  email!: string;

  // UI locale the request came from; the emailed link opens in the same language.
  @IsOptional() @IsIn(['uk', 'no', 'sv', 'pl'])
  locale?: string;
}

export class ResetPasswordDto {
  @IsString() @MinLength(1)
  token!: string;

  @IsString() @MinLength(8)
  password!: string;
}
