import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TripStatus } from '@prisma/client';

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  async search(from: string, to: string, date: string, seats: number) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const trips = await this.prisma.trip.findMany({
      where: {
        fromCity: { contains: from, mode: 'insensitive' },
        toCity: { contains: to, mode: 'insensitive' },
        departureAt: { gte: dayStart, lte: dayEnd },
        status: TripStatus.SCHEDULED,
      },
      include: {
        _count: { select: { bookings: { where: { status: 'CONFIRMED' } } } },
      },
      orderBy: { departureAt: 'asc' },
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
