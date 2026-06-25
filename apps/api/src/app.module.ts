import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 200 }]),
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
  ],
})
export class AppModule {}
