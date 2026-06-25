import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DriverService {
  constructor(private prisma: PrismaService) {}

  async getMyTrips(driverId: string) {
    const trips = await this.prisma.trip.findMany({
      where: { driverId },
      include: {
        vehicle: { select: { plateNumber: true, model: true } },
        _count: { select: { bookings: { where: { status: 'CONFIRMED' } } } },
      },
      orderBy: { departureAt: 'desc' },
    });
    return { data: trips, error: null };
  }

  async getTripPassengers(driverId: string, tripId: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new NotFoundException({ code: 'TRIP_NOT_FOUND', message: 'Trip not found' });
    if (trip.driverId !== driverId) throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Not your trip' });

    const bookings = await this.prisma.booking.findMany({
      where: { tripId, status: 'CONFIRMED' },
      include: {
        user: { select: { firstName: true, lastName: true, phone: true } },
        passengers: true,
      },
      orderBy: { seatNumber: 'asc' },
    });
    return { data: bookings, error: null };
  }

  async updateTripStatus(driverId: string, tripId: string, status: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new NotFoundException({ code: 'TRIP_NOT_FOUND', message: 'Trip not found' });
    if (trip.driverId !== driverId) throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Not your trip' });

    const updated = await this.prisma.trip.update({
      where: { id: tripId },
      data: { status: status as any },
    });
    return { data: updated, error: null };
  }
}
