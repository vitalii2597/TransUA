import { Controller, Get } from '@nestjs/common';
import { ScheduleRunsService } from './schedule-runs.service';

@Controller('schedule-runs')
export class ScheduleRunsController {
  constructor(private scheduleRunsService: ScheduleRunsService) {}

  @Get()
  findAll() {
    return this.scheduleRunsService.findAll();
  }
}
