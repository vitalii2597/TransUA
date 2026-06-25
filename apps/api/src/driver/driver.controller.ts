import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { DriverService } from './driver.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@SkipThrottle()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DRIVER', 'ADMIN')
@Controller('driver')
export class DriverController {
  constructor(private driverService: DriverService) {}

  @Get('trips')
  getMyTrips(@CurrentUser() user: { id: string }) {
    return this.driverService.getMyTrips(user.id);
  }

  @Get('trips/:id/passengers')
  getTripPassengers(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.driverService.getTripPassengers(user.id, id);
  }

  @Patch('trips/:id/status')
  updateTripStatus(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.driverService.updateTripStatus(user.id, id, status);
  }
}
