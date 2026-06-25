import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.booking.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.route.deleteMany();

  const routes = await prisma.route.createManyAndReturn({
    data: [
      { originCountry: 'UA', destinationCountry: 'NO', originCity: 'Kyiv', destinationCity: 'Oslo', durationHours: 60 },
      { originCountry: 'UA', destinationCountry: 'NO', originCity: 'Lviv', destinationCity: 'Oslo', durationHours: 52 },
      { originCountry: 'UA', destinationCountry: 'SE', originCity: 'Kyiv', destinationCity: 'Stockholm', durationHours: 55 },
      { originCountry: 'UA', destinationCountry: 'SE', originCity: 'Lviv', destinationCity: 'Stockholm', durationHours: 48 },
      { originCountry: 'NO', destinationCountry: 'UA', originCity: 'Oslo', destinationCity: 'Kyiv', durationHours: 60 },
      { originCountry: 'SE', destinationCountry: 'UA', originCity: 'Stockholm', destinationCity: 'Kyiv', durationHours: 55 },
    ],
  });

  const routeMap = Object.fromEntries(
    routes.map((r) => [`${r.originCity}-${r.destinationCity}`, r.id]),
  );

  const now = new Date();
  const d = (daysFromNow: number, hour: number) => {
    const dt = new Date(now);
    dt.setDate(dt.getDate() + daysFromNow);
    dt.setHours(hour, 0, 0, 0);
    return dt;
  };

  await prisma.trip.createMany({
    data: [
      { fromCity: 'Kyiv', toCity: 'Oslo', departureAt: d(1, 8), arrivalAt: d(3, 20), priceUah: 4200, totalSeats: 45, routeId: routeMap['Kyiv-Oslo'] },
      { fromCity: 'Kyiv', toCity: 'Oslo', departureAt: d(3, 8), arrivalAt: d(5, 20), priceUah: 4200, totalSeats: 45, routeId: routeMap['Kyiv-Oslo'] },
      { fromCity: 'Kyiv', toCity: 'Oslo', departureAt: d(7, 8), arrivalAt: d(9, 20), priceUah: 3900, totalSeats: 45, routeId: routeMap['Kyiv-Oslo'] },
      { fromCity: 'Kyiv', toCity: 'Stockholm', departureAt: d(2, 9), arrivalAt: d(4, 18), priceUah: 3800, totalSeats: 40, routeId: routeMap['Kyiv-Stockholm'] },
      { fromCity: 'Kyiv', toCity: 'Stockholm', departureAt: d(5, 9), arrivalAt: d(7, 18), priceUah: 3800, totalSeats: 40, routeId: routeMap['Kyiv-Stockholm'] },
      { fromCity: 'Oslo', toCity: 'Kyiv', departureAt: d(1, 10), arrivalAt: d(3, 22), priceUah: 4200, totalSeats: 45, routeId: routeMap['Oslo-Kyiv'] },
      { fromCity: 'Oslo', toCity: 'Kyiv', departureAt: d(4, 10), arrivalAt: d(6, 22), priceUah: 4200, totalSeats: 45, routeId: routeMap['Oslo-Kyiv'] },
      { fromCity: 'Stockholm', toCity: 'Kyiv', departureAt: d(2, 7), arrivalAt: d(4, 19), priceUah: 3800, totalSeats: 40, routeId: routeMap['Stockholm-Kyiv'] },
      { fromCity: 'Lviv', toCity: 'Oslo', departureAt: d(1, 6), arrivalAt: d(3, 16), priceUah: 3600, totalSeats: 50, routeId: routeMap['Lviv-Oslo'] },
      { fromCity: 'Lviv', toCity: 'Oslo', departureAt: d(6, 6), arrivalAt: d(8, 16), priceUah: 3600, totalSeats: 50, routeId: routeMap['Lviv-Oslo'] },
      { fromCity: 'Lviv', toCity: 'Stockholm', departureAt: d(3, 6), arrivalAt: d(5, 14), priceUah: 3400, totalSeats: 50, routeId: routeMap['Lviv-Stockholm'] },
    ],
  });

  console.log(`Seeded ${routes.length} routes and 11 trips`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
