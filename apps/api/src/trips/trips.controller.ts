import { Controller, Get, Param, Query } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { TripsService } from './trips.service';

@SkipThrottle()
@Controller('trips')
export class TripsController {
  constructor(private tripsService: TripsService) {}

  @Get()
  search(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('date') date: string,
    @Query('seats') seats: string,
  ) {
    // No date → list all upcoming departures (timetable view) instead of just today.
    const seatsNum = seats !== undefined && seats !== '' ? Number(seats) : 1;
    return this.tripsService.search(from || '', to || '', date || '', seatsNum);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tripsService.findOne(id);
  }
}
