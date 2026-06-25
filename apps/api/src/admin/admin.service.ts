import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { PatchRoleDto } from './dto/patch-role.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [users, trips, bookings, parcels, revenue] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.trip.count(),
      this.prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      this.prisma.parcelOrder.count(),
      this.prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'COMPLETED' } }),
    ]);
    return {
      data: { users, trips, bookings, parcels, revenueUah: revenue._sum.amount ?? 0 },
      error: null,
    };
  }

  async getUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true, preferredLang: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);
    return { data: users, meta: { page, limit, total }, error: null };
  }

  async patchUserRole(userId: string, dto: PatchRoleDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException({ code: 'USER_NOT_FOUND', message: 'User not found' });
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { role: dto.role },
      select: { id: true, firstName: true, lastName: true, email: true, role: true },
    });
    return { data: updated, error: null };
  }

  async getTrips(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [trips, total] = await Promise.all([
      this.prisma.trip.findMany({
        skip,
        take: limit,
        include: {
          driver: { select: { id: true, firstName: true, lastName: true } },
          vehicle: { select: { id: true, plateNumber: true, model: true } },
          _count: { select: { bookings: { where: { status: 'CONFIRMED' } } } },
        },
        orderBy: { departureAt: 'desc' },
      }),
      this.prisma.trip.count(),
    ]);
    return { data: trips, meta: { page, limit, total }, error: null };
  }

  async createTrip(dto: CreateTripDto) {
    const trip = await this.prisma.trip.create({ data: dto });
    return { data: trip, error: null };
  }

  async patchTripStatus(tripId: string, status: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new NotFoundException({ code: 'TRIP_NOT_FOUND', message: 'Trip not found' });
    const updated = await this.prisma.trip.update({ where: { id: tripId }, data: { status: status as any } });
    return { data: updated, error: null };
  }

  async getParcels(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [parcels, total] = await Promise.all([
      this.prisma.parcelOrder.findMany({
        skip,
        take: limit,
        include: {
          sender: { select: { id: true, firstName: true, lastName: true, phone: true } },
          statusLogs: { orderBy: { loggedAt: 'desc' }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.parcelOrder.count(),
    ]);
    return { data: parcels, meta: { page, limit, total }, error: null };
  }
}
