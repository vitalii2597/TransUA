import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { AdminService } from './admin.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { PatchRoleDto } from './dto/patch-role.dto';
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
  getUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getUsers(Number(page) || 1, Number(limit) || 20);
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
}
