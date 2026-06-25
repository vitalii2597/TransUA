import { IsEmail, IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsString() @MinLength(1) @MaxLength(50)
  firstName!: string;

  @IsString() @MinLength(1) @MaxLength(50)
  lastName!: string;

  @IsString() @Matches(/^\+?[0-9]{9,15}$/, { message: 'Invalid phone number' })
  phone!: string;

  @IsEmail()
  email!: string;

  @IsString() @MinLength(8)
  password!: string;

  @IsOptional() @IsString()
  preferredLang?: string;
}
