import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { AdminService } from './admin.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { PatchRoleDto } from './dto/patch-role.dto';
import { CreateScheduleRunDto } from './dto/create-schedule-run.dto';
import { UpdateScheduleRunDto } from './dto/update-schedule-run.dto';
import { PatchBookingRequestStatusDto } from './dto/patch-booking-request-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@SkipThrottle()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  getUsers(@Query('page') page?: string, @Query('limit') limit?: string, @Query('q') q?: string) {
    // A repeated ?q=a&q=b arrives as an array; only accept a single string.
    return this.adminService.getUsers(Number(page) || 1, Number(limit) || 20, typeof q === 'string' ? q.slice(0, 100) : undefined);
  }

  @Patch('users/:id/role')
  patchUserRole(@Param('id') id: string, @Body() dto: PatchRoleDto) {
    return this.adminService.patchUserRole(id, dto);
  }

  @Get('trips')
  getTrips(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getTrips(Number(page) || 1, Number(limit) || 20);
  }

  @Post('trips')
  createTrip(@Body() dto: CreateTripDto) {
    return this.adminService.createTrip(dto);
  }

  @Patch('trips/:id/status')
  patchTripStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.adminService.patchTripStatus(id, status);
  }

  @Get('parcels')
  getParcels(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getParcels(Number(page) || 1, Number(limit) || 20);
  }

  @Get('schedule-runs')
  getScheduleRuns(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getScheduleRuns(Number(page) || 1, Number(limit) || 20);
  }

  @Post('schedule-runs')
  createScheduleRun(@Body() dto: CreateScheduleRunDto) {
    return this.adminService.createScheduleRun(dto);
  }

  @Patch('schedule-runs/:id')
  updateScheduleRun(@Param('id') id: string, @Body() dto: UpdateScheduleRunDto) {
    return this.adminService.updateScheduleRun(id, dto);
  }

  @Delete('schedule-runs/:id')
  deleteScheduleRun(@Param('id') id: string) {
    return this.adminService.deleteScheduleRun(id);
  }

  @Get('booking-requests')
  getBookingRequests(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getBookingRequests(Number(page) || 1, Number(limit) || 20);
  }

  @Patch('booking-requests/:id/status')
  patchBookingRequestStatus(@Param('id') id: string, @Body() dto: PatchBookingRequestStatusDto) {
    return this.adminService.patchBookingRequestStatus(id, dto.status);
  }
}
