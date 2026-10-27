import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, TripStatus } from '@prisma/client';

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  async search(from: string, to: string, date: string, seats: number) {
    const where: Prisma.TripWhereInput = { status: TripStatus.SCHEDULED };
    if (from) where.fromCity = { contains: from, mode: 'insensitive' };
    if (to) where.toCity = { contains: to, mode: 'insensitive' };

    if (date) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      where.departureAt = { gte: dayStart, lte: dayEnd };
    } else {
      // No date given → timetable view: every upcoming departure from now on.
      where.departureAt = { gte: new Date() };
    }

    const trips = await this.prisma.trip.findMany({
      where,
      include: {
        _count: { select: { bookings: { where: { status: 'CONFIRMED' } } } },
      },
      orderBy: { departureAt: 'asc' },
      take: 60,
    });

    return {
      data: trips
        .map((t) => ({
          ...t,
          seatsAvailable: t.totalSeats - t._count.bookings,
        }))
        .filter((t) => t.seatsAvailable >= seats),
      error: null,
    };
  }

  async findOne(id: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: {
        bookings: {
          where: { status: 'CONFIRMED' },
          select: { seatNumber: true },
        },
      },
    });
    if (!trip) throw new NotFoundException({ code: 'TRIP_NOT_FOUND', message: 'Trip not found' });

    const takenSeats = trip.bookings.map((b) => b.seatNumber);
    const { bookings: _, ...tripData } = trip;
    return { data: { ...tripData, takenSeats }, error: null };
  }
}
