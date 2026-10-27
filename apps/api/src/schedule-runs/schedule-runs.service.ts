import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScheduleRunsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const runs = await this.prisma.scheduleRun.findMany({
      orderBy: [{ parcelsDate: 'asc' }],
    });
    return { data: runs, error: null };
  }
}
