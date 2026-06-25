import { Controller, Post, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ParcelsService } from './parcels.service';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { UpdateParcelStatusDto } from './dto/update-parcel-status.dto';
import { QuoteParcelDto } from './dto/quote-parcel.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@SkipThrottle()
@Controller('parcels')
export class ParcelsController {
  constructor(private parcelsService: ParcelsService) {}

  @Post('quote')
  quote(@Body() dto: QuoteParcelDto) {
    return this.parcelsService.quote(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateParcelDto) {
    return this.parcelsService.create(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findMine(@CurrentUser() user: { id: string }) {
    return this.parcelsService.findMine(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.parcelsService.findOne(user.id, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DRIVER', 'ADMIN')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateParcelStatusDto) {
    return this.parcelsService.updateStatus(id, dto);
  }
}
