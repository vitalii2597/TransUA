import { Controller, Get, Param, Query } from '@nestjs/common';
import { TripsService } from './trips.service';

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
    const parsed = Number(seats);
    const seatsNum = Number.isInteger(parsed) && parsed >= 1 ? parsed : 1;
    return this.tripsService.search(from || '', to || '', date || '', seatsNum);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tripsService.findOne(id);
  }
}
