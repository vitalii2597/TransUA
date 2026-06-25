import { IsString, IsInt, Min, MinLength } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  @MinLength(2)
  plateNumber!: string;

  @IsString()
  @MinLength(2)
  model!: string;

  @IsInt()
  @Min(1)
  capacity!: number;
}
