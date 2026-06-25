-- CreateEnum
CREATE TYPE "ParcelStatus" AS ENUM ('PENDING_PICKUP', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'RETURNED');

-- CreateTable
CREATE TABLE "ParcelOrder" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "tripId" TEXT,
    "pickupAddress" TEXT NOT NULL,
    "deliveryAddress" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "recipientPhone" TEXT NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "status" "ParcelStatus" NOT NULL DEFAULT 'PENDING_PICKUP',
    "trackingCode" TEXT NOT NULL,
    "priceEur" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParcelOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParcelStatusLog" (
    "id" TEXT NOT NULL,
    "parcelId" TEXT NOT NULL,
    "status" "ParcelStatus" NOT NULL,
    "location" TEXT,
    "note" TEXT,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParcelStatusLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParcelOrder_trackingCode_key" ON "ParcelOrder"("trackingCode");

-- AddForeignKey
ALTER TABLE "ParcelOrder" ADD CONSTRAINT "ParcelOrder_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParcelOrder" ADD CONSTRAINT "ParcelOrder_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParcelStatusLog" ADD CONSTRAINT "ParcelStatusLog_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "ParcelOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
