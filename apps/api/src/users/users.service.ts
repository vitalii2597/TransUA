import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException({ code: 'USER_NOT_FOUND', message: 'User not found' });
    const { passwordHash: _, ...userSafe } = user;
    return { data: userSafe, error: null };
  }

  async updateMe(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({ where: { id: userId }, data: dto });
    const { passwordHash: _, ...userSafe } = user;
    return { data: userSafe, error: null };
  }

  // Right to erasure (GDPR Art. 17): a plain `user.delete` fails with a foreign-key
  // violation for anyone with a booking, payment, or parcel, since those don't cascade
  // on User. Walk the graph in FK-safe order — vehicles/trips first (required driverId),
  // then bookings/payments (Booking.paymentId references Payment), then parcels — before
  // deleting the user itself (RefreshToken/BookingPassenger/ParcelStatusLog cascade).
  async deleteMe(userId: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.trip.updateMany({ where: { driverId: userId }, data: { driverId: null } });

      const vehicles = await tx.vehicle.findMany({ where: { driverId: userId }, select: { id: true } });
      const vehicleIds = vehicles.map((v) => v.id);
      if (vehicleIds.length > 0) {
        await tx.trip.updateMany({ where: { vehicleId: { in: vehicleIds } }, data: { vehicleId: null } });
      }
      await tx.vehicle.deleteMany({ where: { driverId: userId } });

      await tx.booking.deleteMany({ where: { userId } });
      await tx.payment.deleteMany({ where: { payerId: userId } });
      await tx.parcelOrder.deleteMany({ where: { senderId: userId } });

      await tx.user.delete({ where: { id: userId } });
    });
    return { data: { deleted: true }, error: null };
  }
}
