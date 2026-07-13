-- CreateTable
CREATE TABLE "ScheduleRun" (
    "id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "parcelsDate" TIMESTAMP(3) NOT NULL,
    "parcelsCutoff" TIMESTAMP(3) NOT NULL,
    "passengersDate" TIMESTAMP(3) NOT NULL,
    "destinationStart" TIMESTAMP(3) NOT NULL,
    "destinationEnd" TIMESTAMP(3) NOT NULL,
    "returnDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduleRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleRun_month_number_key" ON "ScheduleRun"("month", "number");
