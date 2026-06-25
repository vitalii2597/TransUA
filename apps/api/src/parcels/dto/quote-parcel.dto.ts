import { IsNumber, Min, Max, IsEnum } from 'class-validator';

export enum DestinationCountry {
  NO = 'NO',
  SE = 'SE',
}

export class QuoteParcelDto {
  @IsNumber()
  @Min(0.1)
  @Max(50)
  weightKg!: number;

  @IsEnum(DestinationCountry)
  destinationCountry!: DestinationCountry;
}
