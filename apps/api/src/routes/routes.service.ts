import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';

@Injectable()
export class RoutesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const routes = await this.prisma.route.findMany({
      where: { active: true },
      orderBy: [{ originCity: 'asc' }, { destinationCity: 'asc' }],
    });
    return { data: routes, error: null };
  }

  async create(dto: CreateRouteDto) {
    const route = await this.prisma.route.create({ data: dto });
    return { data: route, error: null };
  }
}
