import { IsString, IsNumber, Min, Max, MinLength, IsOptional } from 'class-validator';

export class CreateParcelDto {
  @IsOptional()
  @IsString()
  tripId?: string;

  @IsString()
  @MinLength(5)
  pickupAddress!: string;

  @IsString()
  @MinLength(5)
  deliveryAddress!: string;

  @IsString()
  @MinLength(2)
  recipientName!: string;

  @IsString()
  @MinLength(5)
  recipientPhone!: string;

  @IsNumber()
  @Min(0.1)
  @Max(50)
  weightKg!: number;

  @IsOptional()
  @IsString()
  description?: string;
}
