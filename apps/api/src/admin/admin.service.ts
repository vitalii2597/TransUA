import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { PatchRoleDto } from './dto/patch-role.dto';
import { CreateScheduleRunDto } from './dto/create-schedule-run.dto';
import { UpdateScheduleRunDto } from './dto/update-schedule-run.dto';

const DAY_MS = 86400000;
function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

// Query-string paging → safe integers. Infinity/1e20 would otherwise reach Prisma as `skip` and 500.
function clampPaging(page: number, limit: number) {
  return {
    page: Number.isFinite(page) ? Math.min(10_000, Math.max(1, Math.floor(page))) : 1,
    limit: Number.isFinite(limit) ? Math.min(100, Math.max(1, Math.floor(limit))) : 20,
  };
}

// @@unique([month, number]) violation → 409 the admin UI can explain, instead of a generic 500.
function rethrowDuplicateRun(err: unknown): never {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    throw new ConflictException({ code: 'SCHEDULE_RUN_EXISTS', message: 'A run with this month and number already exists' });
  }
  throw err;
}

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

  async getUsers(page = 1, limit = 20, q?: string) {
    ({ page, limit } = clampPaging(page, limit));
    const skip = (page - 1) * limit;
    // Every word must match some field, so "Vitalii Mayuk" finds first + last name.
    const words = q?.trim().split(/\s+/).filter(Boolean).slice(0, 5) ?? []; // cap: each word adds 4 ILIKEs
    const where: Prisma.UserWhereInput = {
      AND: words.map((w) => ({
        OR: [
          { email: { contains: w, mode: 'insensitive' as const } },
          { firstName: { contains: w, mode: 'insensitive' as const } },
          { lastName: { contains: w, mode: 'insensitive' as const } },
          { phone: { contains: w } },
        ],
      })),
    };
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true, preferredLang: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
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

  async getScheduleRuns(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [runs, total] = await Promise.all([
      this.prisma.scheduleRun.findMany({
        skip,
        take: limit,
        orderBy: { parcelsDate: 'desc' },
      }),
      this.prisma.scheduleRun.count(),
    ]);
    return { data: runs, meta: { page, limit, total }, error: null };
  }

  async createScheduleRun(dto: CreateScheduleRunDto) {
    const parcelsDate = new Date(dto.parcelsDate);
    const parcelsCutoff = dto.parcelsCutoff ? new Date(dto.parcelsCutoff) : addDays(parcelsDate, -1);
    const passengersDate = dto.passengersDate ? new Date(dto.passengersDate) : addDays(parcelsDate, 2);
    const destinationStart = dto.destinationStart ? new Date(dto.destinationStart) : addDays(passengersDate, 2);
    const destinationEnd = dto.destinationEnd ? new Date(dto.destinationEnd) : addDays(destinationStart, 3);
    const returnDate = dto.returnDate ? new Date(dto.returnDate) : destinationEnd;

    const run = await this.prisma.scheduleRun
      .create({
        data: {
          month: dto.month,
          number: dto.number,
          parcelsDate,
          parcelsCutoff,
          passengersDate,
          destinationStart,
          destinationEnd,
          returnDate,
        },
      })
      .catch(rethrowDuplicateRun);
    return { data: run, error: null };
  }

  async updateScheduleRun(runId: string, dto: UpdateScheduleRunDto) {
    const existing = await this.prisma.scheduleRun.findUnique({ where: { id: runId } });
    if (!existing) throw new NotFoundException({ code: 'SCHEDULE_RUN_NOT_FOUND', message: 'Schedule run not found' });

    const dateFields = ['parcelsDate', 'parcelsCutoff', 'passengersDate', 'destinationStart', 'destinationEnd', 'returnDate'] as const;
    const data: Record<string, unknown> = {};
    if (dto.month !== undefined) data.month = dto.month;
    if (dto.number !== undefined) data.number = dto.number;
    for (const field of dateFields) {
      if (dto[field] !== undefined) data[field] = new Date(dto[field] as string);
    }

    const updated = await this.prisma.scheduleRun.update({ where: { id: runId }, data }).catch(rethrowDuplicateRun);
    return { data: updated, error: null };
  }

  async deleteScheduleRun(runId: string) {
    const existing = await this.prisma.scheduleRun.findUnique({ where: { id: runId } });
    if (!existing) throw new NotFoundException({ code: 'SCHEDULE_RUN_NOT_FOUND', message: 'Schedule run not found' });
    // Open (NEW/CONFIRMED) requests block deletion; cancelled ones go with the run.
    const hasRequests = () =>
      new ConflictException({
        code: 'SCHEDULE_RUN_HAS_REQUESTS',
        message: 'This run has open booking requests — cancel them before deleting it',
      });
    await this.prisma
      .$transaction(async (tx) => {
        const open = await tx.bookingRequest.count({ where: { scheduleRunId: runId, status: { not: 'CANCELLED' } } });
        if (open > 0) throw hasRequests();
        await tx.bookingRequest.deleteMany({ where: { scheduleRunId: runId } });
        await tx.scheduleRun.delete({ where: { id: runId } });
      })
      .catch((err) => {
        // A request created between the count and the delete trips the Restrict FK.
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') throw hasRequests();
        throw err;
      });
    return { data: { id: runId }, error: null };
  }

  async getBookingRequests(page = 1, limit = 20) {
    ({ page, limit } = clampPaging(page, limit));
    const skip = (page - 1) * limit;
    const [requests, total] = await Promise.all([
      this.prisma.bookingRequest.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          scheduleRun: { select: { month: true, number: true, passengersDate: true, returnDate: true } },
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      }),
      this.prisma.bookingRequest.count(),
    ]);
    return { data: requests, meta: { page, limit, total }, error: null };
  }

  async patchBookingRequestStatus(id: string, status: 'NEW' | 'CONFIRMED' | 'CANCELLED') {
    const existing = await this.prisma.bookingRequest.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException({ code: 'BOOKING_REQUEST_NOT_FOUND', message: 'Booking request not found' });
    const updated = await this.prisma.bookingRequest.update({ where: { id }, data: { status } });
    return { data: updated, error: null };
  }
}
