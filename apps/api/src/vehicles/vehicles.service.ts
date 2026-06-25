import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const vehicles = await this.prisma.vehicle.findMany({
      include: { driver: { select: { id: true, firstName: true, lastName: true, phone: true } } },
      orderBy: { plateNumber: 'asc' },
    });
    return { data: vehicles, error: null };
  }

  async create(driverId: string, dto: CreateVehicleDto) {
    const vehicle = await this.prisma.vehicle.create({
      data: { driverId, ...dto },
      include: { driver: { select: { id: true, firstName: true, lastName: true } } },
    });
    return { data: vehicle, error: null };
  }

  async toggleActive(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundException({ code: 'VEHICLE_NOT_FOUND', message: 'Vehicle not found' });
    const updated = await this.prisma.vehicle.update({
      where: { id },
      data: { active: !vehicle.active },
    });
    return { data: updated, error: null };
  }
}
