import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ScheduleRunsService } from './schedule-runs.service';

@SkipThrottle()
@Controller('schedule-runs')
export class ScheduleRunsController {
  constructor(private scheduleRunsService: ScheduleRunsService) {}

  @Get()
  findAll() {
    return this.scheduleRunsService.findAll();
  }
}
