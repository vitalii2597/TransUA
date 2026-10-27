import { IsString, IsInt, Min, IsDateString, IsOptional, Matches } from 'class-validator';

export class UpdateScheduleRunDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/)
  month?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  number?: number;

  @IsOptional()
  @IsDateString()
  parcelsDate?: string;

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
