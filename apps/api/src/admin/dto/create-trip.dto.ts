import { IsString, IsInt, IsNumber, Min, IsDateString, IsOptional } from 'class-validator';

export class CreateTripDto {
  @IsString()
  fromCity!: string;

  @IsString()
  toCity!: string;

  @IsDateString()
  departureAt!: string;

  @IsDateString()
  arrivalAt!: string;

  @IsNumber()
  @Min(1)
  priceUah!: number;

  @IsInt()
  @Min(1)
  totalSeats!: number;

  @IsOptional()
  @IsString()
  routeId?: string;

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsOptional()
  @IsString()
  vehicleId?: string;
}
