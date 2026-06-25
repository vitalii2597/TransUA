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
    return this.tripsService.search(from || '', to || '', date || new Date().toISOString().split('T')[0], Number(seats) || 1);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tripsService.findOne(id);
  }
}
