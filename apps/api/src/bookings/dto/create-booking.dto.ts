import { IsString, IsInt, Min, Max, MinLength, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PassengerDto {
  @IsString()
  @MinLength(2)
  fullName!: string;

  @IsOptional()
  @IsString()
  documentNumber?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class CreateBookingDto {
  @IsString()
  tripId!: string;

  @IsInt()
  @Min(1)
  @Max(100)
  seatNumber!: number;

  @IsString()
  @MinLength(2)
  passengerName!: string;

  @IsOptional()
  @IsString()
  pickupAddress?: string;

  @IsOptional()
  @IsString()
  dropoffAddress?: string;

  @IsOptional()
  @IsNumber()
  luggageKg?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PassengerDto)
  passengers?: PassengerDto[];
}
