import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ParcelStatus {
  PENDING_PICKUP = 'PENDING_PICKUP',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED',
}

export class UpdateParcelStatusDto {
  @IsEnum(ParcelStatus)
  status!: ParcelStatus;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
