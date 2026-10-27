import { IsIn } from 'class-validator';

export class PatchBookingRequestStatusDto {
  @IsIn(['NEW', 'CONFIRMED', 'CANCELLED'])
  status!: 'NEW' | 'CONFIRMED' | 'CANCELLED';
}
