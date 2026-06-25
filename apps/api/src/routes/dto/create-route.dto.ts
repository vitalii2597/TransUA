import { IsString, IsInt, Min } from 'class-validator';

export class CreateRouteDto {
  @IsString() originCountry!: string;
  @IsString() destinationCountry!: string;
  @IsString() originCity!: string;
  @IsString() destinationCity!: string;
  @IsInt() @Min(1) durationHours!: number;
}
