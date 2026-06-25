import { Controller, Post, Get, Delete, Param, Body, UseGuards, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Response } from 'express';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@SkipThrottle()
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(user.id, dto);
  }

  @Get('my')
  findMine(@CurrentUser() user: { id: string }) {
    return this.bookingsService.findMine(user.id);
  }

  @Delete(':id')
  cancel(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.bookingsService.cancel(user.id, id);
  }

  @Get(':id/ticket.pdf')
  async getTicket(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const pdf = await this.bookingsService.getTicketPdf(user.id, id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="ticket-${id.slice(0, 8)}.pdf"`,
      'Content-Length': pdf.length,
    });
    res.end(pdf);
  }
}
