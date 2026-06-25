import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { UpdateParcelStatusDto, ParcelStatus } from './dto/update-parcel-status.dto';
import { QuoteParcelDto, DestinationCountry } from './dto/quote-parcel.dto';

const BASE_PRICE_EUR = 15;
const BASE_WEIGHT_KG = 5;
const EXTRA_KG_PRICE_EUR = 2;
const SWEDEN_SURCHARGE_EUR = 5;
const MAX_WEIGHT_KG = 50;

function calcPrice(weightKg: number, destinationCountry: DestinationCountry): number {
  const extra = Math.max(0, weightKg - BASE_WEIGHT_KG);
  let price = BASE_PRICE_EUR + extra * EXTRA_KG_PRICE_EUR;
  if (destinationCountry === DestinationCountry.SE) price += SWEDEN_SURCHARGE_EUR;
  return Math.round(price * 100) / 100;
}

function generateTrackingCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'TUA-PKG-';
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function detectDestinationCountry(deliveryAddress: string): DestinationCountry {
  const lower = deliveryAddress.toLowerCase();
  if (lower.includes('sweden') || lower.includes('sverige') || lower.includes('швеція') || lower.includes('stockholm') || lower.includes('göteborg') || lower.includes('gothenburg') || lower.includes('malmö')) {
    return DestinationCountry.SE;
  }
  return DestinationCountry.NO;
}

@Injectable()
export class ParcelsService {
  constructor(private prisma: PrismaService) {}

  quote(dto: QuoteParcelDto) {
    if (dto.weightKg > MAX_WEIGHT_KG) {
      throw new BadRequestException({ code: 'WEIGHT_TOO_HIGH', message: 'Weight exceeds 50 kg — please contact us by phone' });
    }
    const priceEur = calcPrice(dto.weightKg, dto.destinationCountry);
    const deliveryDays = dto.destinationCountry === DestinationCountry.SE ? 5 : 4;
    return { data: { priceEur, weightKg: dto.weightKg, destinationCountry: dto.destinationCountry, deliveryDays }, error: null };
  }

  async create(senderId: string, dto: CreateParcelDto) {
    if (dto.weightKg > MAX_WEIGHT_KG) {
      throw new BadRequestException({ code: 'WEIGHT_TOO_HIGH', message: 'Weight exceeds 50 kg — please contact us by phone' });
    }

    const destinationCountry = detectDestinationCountry(dto.deliveryAddress);
    const priceEur = calcPrice(dto.weightKg, destinationCountry);

    let trackingCode: string;
    let attempts = 0;
    do {
      trackingCode = generateTrackingCode();
      attempts++;
      if (attempts > 10) throw new Error('Could not generate unique tracking code');
    } while (await this.prisma.parcelOrder.findUnique({ where: { trackingCode } }));

    const parcel = await this.prisma.parcelOrder.create({
      data: {
        senderId,
        tripId: dto.tripId,
        pickupAddress: dto.pickupAddress,
        deliveryAddress: dto.deliveryAddress,
        recipientName: dto.recipientName,
        recipientPhone: dto.recipientPhone,
        weightKg: dto.weightKg,
        description: dto.description,
        priceEur,
        trackingCode,
        statusLogs: {
          create: { status: 'PENDING_PICKUP', note: 'Order created' },
        },
      },
      include: { statusLogs: true },
    });

    return { data: parcel, error: null };
  }

  async findMine(senderId: string) {
    const parcels = await this.prisma.parcelOrder.findMany({
      where: { senderId },
      include: { statusLogs: { orderBy: { loggedAt: 'desc' } } },
      orderBy: { createdAt: 'desc' },
    });
    return { data: parcels, error: null };
  }

  async findOne(senderId: string, parcelId: string) {
    const parcel = await this.prisma.parcelOrder.findUnique({
      where: { id: parcelId },
      include: { statusLogs: { orderBy: { loggedAt: 'asc' } } },
    });
    if (!parcel) throw new NotFoundException({ code: 'PARCEL_NOT_FOUND', message: 'Parcel not found' });
    if (parcel.senderId !== senderId) throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Not your parcel' });
    return { data: parcel, error: null };
  }

  async updateStatus(parcelId: string, dto: UpdateParcelStatusDto) {
    const parcel = await this.prisma.parcelOrder.findUnique({ where: { id: parcelId } });
    if (!parcel) throw new NotFoundException({ code: 'PARCEL_NOT_FOUND', message: 'Parcel not found' });

    const updated = await this.prisma.parcelOrder.update({
      where: { id: parcelId },
      data: {
        status: dto.status,
        statusLogs: {
          create: { status: dto.status, location: dto.location, note: dto.note },
        },
      },
      include: { statusLogs: { orderBy: { loggedAt: 'asc' } } },
    });

    return { data: updated, error: null };
  }
}
