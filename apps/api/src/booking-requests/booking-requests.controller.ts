import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { BookingRequestsService } from './booking-requests.service';
import { CreateBookingRequestDto } from './dto/create-booking-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('booking-requests')
export class BookingRequestsController {
  constructor(private bookingRequestsService: BookingRequestsService) {}

  // Real customers send one request per trip; this blunts scripted flooding of the admin queue.
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateBookingRequestDto) {
    return this.bookingRequestsService.create(user.id, dto);
  }
}
