import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import PDFDocument from 'pdfkit';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateBookingDto) {
    const trip = await this.prisma.trip.findUnique({ where: { id: dto.tripId } });
    if (!trip || trip.status === 'CANCELLED' || trip.status === 'COMPLETED') {
      throw new NotFoundException({ code: 'TRIP_NOT_FOUND', message: 'Trip not found or not available' });
    }

    const takenCount = await this.prisma.booking.count({
      where: { tripId: dto.tripId, status: 'CONFIRMED' },
    });
    if (takenCount >= trip.totalSeats) {
      throw new ConflictException({ code: 'TRIP_FULL', message: 'No seats available' });
    }

    if (dto.seatNumber < 1 || dto.seatNumber > trip.totalSeats) {
      throw new ConflictException({ code: 'INVALID_SEAT', message: 'Invalid seat number' });
    }

    try {
      const booking = await this.prisma.$transaction(async (tx) => {
        const payment = await tx.payment.create({
          data: {
            payerId: userId,
            amount: trip.priceUah,
            currency: 'UAH',
            method: 'CASH',
            status: 'PENDING',
          },
        });

        const newBooking = await tx.booking.create({
          data: {
            userId,
            tripId: dto.tripId,
            seatNumber: dto.seatNumber,
            passengerName: dto.passengerName,
            pickupAddress: dto.pickupAddress,
            dropoffAddress: dto.dropoffAddress,
            luggageKg: dto.luggageKg,
            paymentId: payment.id,
            passengers: dto.passengers?.length
              ? { create: dto.passengers.map((p) => ({ fullName: p.fullName, documentNumber: p.documentNumber, phone: p.phone })) }
              : undefined,
          },
          include: { trip: true, payment: true, passengers: true },
        });

        return newBooking;
      });

      return { data: booking, error: null };
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new ConflictException({ code: 'SEAT_TAKEN', message: 'This seat is already booked' });
      }
      throw e;
    }
  }

  async findMine(userId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: { userId },
      include: { trip: true, payment: true, passengers: true },
      orderBy: { createdAt: 'desc' },
    });
    return { data: bookings, error: null };
  }

  async cancel(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException({ code: 'BOOKING_NOT_FOUND', message: 'Booking not found' });
    if (booking.userId !== userId) throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Not your booking' });
    if (booking.status === 'CANCELLED') {
      throw new ConflictException({ code: 'ALREADY_CANCELLED', message: 'Booking already cancelled' });
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
      include: { trip: true, payment: true, passengers: true },
    });
    return { data: updated, error: null };
  }

  async getTicketPdf(userId: string, bookingId: string): Promise<Buffer> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { trip: true, user: true, passengers: true },
    });
    if (!booking) throw new NotFoundException({ code: 'BOOKING_NOT_FOUND', message: 'Booking not found' });
    if (booking.userId !== userId) throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Not your booking' });

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A5' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(22).font('Helvetica-Bold').text('TransUA', { align: 'center' });
      doc.fontSize(12).font('Helvetica').text('Ukraine ↔ Norway / Sweden', { align: 'center' });
      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown();
      doc.fontSize(16).font('Helvetica-Bold').text('BOARDING PASS', { align: 'center' });
      doc.moveDown();

      const t = booking.trip;
      const fmt = (d: Date) => d.toLocaleString('uk-UA', { dateStyle: 'medium', timeStyle: 'short' });

      doc.fontSize(12).font('Helvetica-Bold').text(`${t.fromCity}  →  ${t.toCity}`, { align: 'center' });
      doc.moveDown(0.5);

      const rows: [string, string][] = [
        ['Passenger', booking.passengerName],
        ['Departure', fmt(new Date(t.departureAt))],
        ['Arrival', fmt(new Date(t.arrivalAt))],
        ['Seat', String(booking.seatNumber)],
      ];

      if (booking.pickupAddress) rows.push(['Pickup', booking.pickupAddress]);
      if (booking.dropoffAddress) rows.push(['Dropoff', booking.dropoffAddress]);
      if (booking.luggageKg) rows.push(['Luggage', `${booking.luggageKg} kg`]);

      rows.push(
        ['Price', `${t.priceUah} UAH  (Cash on board)`],
        ['Booking ref', booking.id.slice(0, 8).toUpperCase()],
        ['Status', booking.status],
      );

      for (const [label, value] of rows) {
        doc.font('Helvetica-Bold').text(`${label}:  `, { continued: true }).font('Helvetica').text(value);
      }

      if (booking.passengers.length > 0) {
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').text('Additional passengers:');
        for (const p of booking.passengers) {
          doc.font('Helvetica').text(`  • ${p.fullName}${p.documentNumber ? ' · doc: ' + p.documentNumber : ''}`);
        }
      }

      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica').fillColor('gray')
        .text('Please present this ticket to the driver. Payment is collected in cash on board.', { align: 'center' });

      doc.end();
    });
  }
}
