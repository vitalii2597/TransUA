import { Module } from '@nestjs/common';
import { ScheduleRunsController } from './schedule-runs.controller';
import { ScheduleRunsService } from './schedule-runs.service';

@Module({
  controllers: [ScheduleRunsController],
  providers: [ScheduleRunsService],
})
export class ScheduleRunsModule {}
