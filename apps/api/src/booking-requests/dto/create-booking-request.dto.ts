import { IsUUID, IsIn, IsInt, Min, Max, IsString, MaxLength, Matches, IsOptional } from 'class-validator';

export class CreateBookingRequestDto {
  @IsUUID()
  scheduleRunId!: string;

  @IsIn(['TO_NORWAY', 'TO_UKRAINE'])
  direction!: 'TO_NORWAY' | 'TO_UKRAINE';

  @IsInt() @Min(1) @Max(8)
  passengers!: number;

  // \S: reject whitespace-only values, which the service would trim to "".
  @IsString() @Matches(/\S/) @MaxLength(100)
  fromCity!: string;

  @IsString() @Matches(/\S/) @MaxLength(100)
  toCity!: string;

  @IsString() @Matches(/^\+?[0-9]{9,15}$/, { message: 'Invalid phone number' })
  phone!: string;

  @IsOptional() @IsString() @MaxLength(500)
  comment?: string;
}
