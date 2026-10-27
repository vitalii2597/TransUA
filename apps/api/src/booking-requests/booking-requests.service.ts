import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingRequestDto } from './dto/create-booking-request.dto';

// Enough for outbound + return + one correction; more is almost certainly spam.
const MAX_PENDING_PER_RUN = 3;

@Injectable()
export class BookingRequestsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateBookingRequestDto) {
    const run = await this.prisma.scheduleRun.findUnique({ where: { id: dto.scheduleRunId } });
    if (!run) throw new NotFoundException({ code: 'SCHEDULE_RUN_NOT_FOUND', message: 'Schedule run not found' });

    // Run dates are stored as UTC midnight of the calendar day, so compare against
    // today's UTC midnight: same-day departures are still requestable.
    const departure = dto.direction === 'TO_NORWAY' ? run.passengersDate : run.returnDate;
    const todayUtc = new Date();
    todayUtc.setUTCHours(0, 0, 0, 0);
    if (departure < todayUtc) {
      throw new BadRequestException({ code: 'RUN_DEPARTED', message: 'This departure has already left' });
    }

    const pending = await this.prisma.bookingRequest.count({
      where: { userId, scheduleRunId: run.id, status: 'NEW' },
    });
    if (pending >= MAX_PENDING_PER_RUN) {
      throw new ConflictException({
        code: 'TOO_MANY_PENDING_REQUESTS',
        message: 'You already have pending requests for this run — we will call you to confirm them',
      });
    }

    const request = await this.prisma.bookingRequest.create({
      data: {
        scheduleRunId: run.id,
        userId,
        direction: dto.direction,
        passengers: dto.passengers,
        fromCity: dto.fromCity.trim(),
        toCity: dto.toCity.trim(),
        phone: dto.phone,
        comment: dto.comment?.trim() || null,
      },
    });
    return { data: request, error: null };
  }
}
