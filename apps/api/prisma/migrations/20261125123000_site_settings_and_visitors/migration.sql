-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL,
    "usdToIqdRate" DECIMAL(12,4) NOT NULL DEFAULT 1310,
    "enableIqdDisplay" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceBrand" (
    "serviceId" UUID NOT NULL,
    "brandId" UUID NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ServiceBrand_pkey" PRIMARY KEY ("serviceId","brandId")
);

-- CreateTable
CREATE TABLE "DailyVisitor" (
    "id" UUID NOT NULL,
    "surface" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "hits" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyVisitor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceBrand_brandId_idx" ON "ServiceBrand"("brandId");

-- CreateIndex
CREATE INDEX "ServiceBrand_sortOrder_idx" ON "ServiceBrand"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "DailyVisitor_surface_visitorId_day_key" ON "DailyVisitor"("surface", "visitorId", "day");

-- CreateIndex
CREATE INDEX "DailyVisitor_surface_day_idx" ON "DailyVisitor"("surface", "day");

-- AddForeignKey
ALTER TABLE "ServiceBrand" ADD CONSTRAINT "ServiceBrand_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceBrand" ADD CONSTRAINT "ServiceBrand_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
