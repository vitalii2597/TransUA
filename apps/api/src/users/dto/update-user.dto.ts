import { IsString, IsOptional, MinLength, MaxLength, Matches, IsIn } from 'class-validator';

export class UpdateUserDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(50)
  firstName?: string;

  @IsOptional() @IsString() @MinLength(1) @MaxLength(50)
  lastName?: string;

  @IsOptional() @IsString() @Matches(/^\+?[0-9]{9,15}$/)
  phone?: string;

  @IsOptional() @IsIn(['uk', 'no', 'sv', 'pl'])
  preferredLang?: string;
}
