import { IsString, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';

export class UpdateUserDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(50)
  firstName?: string;

  @IsOptional() @IsString() @MinLength(1) @MaxLength(50)
  lastName?: string;

  @IsOptional() @IsString() @Matches(/^\+?[0-9]{9,15}$/)
  phone?: string;

  @IsOptional() @IsString()
  preferredLang?: string;
}
