-- CreateEnum
CREATE TYPE "PropertyEventType" AS ENUM ('PROPERTY_OPENED', 'CONTACT_CLICKED', 'BOOKING_CLICKED');

-- CreateTable
CREATE TABLE "PropertyEvent" (
  "id" TEXT NOT NULL,
  "propertyId" TEXT,
  "eventType" "PropertyEventType" NOT NULL,
  "page" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PropertyEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PropertyEvent_propertyId_createdAt_idx" ON "PropertyEvent"("propertyId", "createdAt");

-- CreateIndex
CREATE INDEX "PropertyEvent_eventType_createdAt_idx" ON "PropertyEvent"("eventType", "createdAt");

-- AddForeignKey
ALTER TABLE "PropertyEvent" ADD CONSTRAINT "PropertyEvent_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;
