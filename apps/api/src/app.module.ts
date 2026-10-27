import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TripsModule } from './trips/trips.module';
import { BookingsModule } from './bookings/bookings.module';
import { RoutesModule } from './routes/routes.module';
import { ParcelsModule } from './parcels/parcels.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { AdminModule } from './admin/admin.module';
import { DriverModule } from './driver/driver.module';
import { GpsModule } from './gps/gps.module';
import { ScheduleRunsModule } from './schedule-runs/schedule-runs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 200 }],
      // Local-only escape hatch: the e2e suite registers/logs in far more than 5×/min.
      skipIf: () => process.env.THROTTLE_DISABLED === 'true',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    TripsModule,
    BookingsModule,
    RoutesModule,
    ParcelsModule,
    VehiclesModule,
    AdminModule,
    DriverModule,
    GpsModule,
    ScheduleRunsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
