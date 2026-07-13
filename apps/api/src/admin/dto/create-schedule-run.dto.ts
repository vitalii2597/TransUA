import { IsString, IsInt, Min, IsDateString, IsOptional, Matches } from 'class-validator';

export class CreateScheduleRunDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}$/)
  month!: string;

  @IsInt()
  @Min(1)
  number!: number;

  @IsDateString()
  parcelsDate!: string;

  // Optional overrides — if omitted, derived from parcelsDate using the
  // corridor's fixed offsets (cutoff -1d, passengers +2d, destination +2d/+3d, return = destination end).
  @IsOptional()
  @IsDateString()
  parcelsCutoff?: string;

  @IsOptional()
  @IsDateString()
  passengersDate?: string;

  @IsOptional()
  @IsDateString()
  destinationStart?: string;

  @IsOptional()
  @IsDateString()
  destinationEnd?: string;

  @IsOptional()
  @IsDateString()
  returnDate?: string;
}
