import { Module } from '@nestjs/common';
import { GpsGateway } from './gps.gateway';
import { GpsService } from './gps.service';

@Module({
  providers: [GpsGateway, GpsService],
  exports: [GpsGateway],
})
export class GpsModule {}
