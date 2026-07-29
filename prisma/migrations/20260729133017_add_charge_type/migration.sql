-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNo" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "memberCount" INTEGER NOT NULL,
    "pricePerPersonSnapshot" INTEGER NOT NULL,
    "discountAmountSnapshot" INTEGER NOT NULL,
    "discountModeSnapshot" TEXT NOT NULL,
    "depositAmountSnapshot" INTEGER NOT NULL,
    "depositModeSnapshot" TEXT NOT NULL,
    "chargeTypeSnapshot" TEXT NOT NULL DEFAULT 'DEPOSIT',
    "subtotal" INTEGER NOT NULL,
    "totalDiscount" INTEGER NOT NULL,
    "totalDue" INTEGER NOT NULL,
    "depositRequired" INTEGER NOT NULL,
    "balanceDue" INTEGER NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
    "bankTransferLast5" TEXT,
    "bankReceiptFileId" TEXT,
    "confirmationEmailSentAt" DATETIME,
    "receiptEmailSentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("balanceDue", "bankReceiptFileId", "bankTransferLast5", "confirmationEmailSentAt", "contactEmail", "contactName", "contactPhone", "createdAt", "depositAmountSnapshot", "depositModeSnapshot", "depositRequired", "discountAmountSnapshot", "discountModeSnapshot", "id", "memberCount", "orderNo", "paymentMethod", "paymentStatus", "pricePerPersonSnapshot", "receiptEmailSentAt", "subtotal", "totalDiscount", "totalDue", "tourId", "updatedAt") SELECT "balanceDue", "bankReceiptFileId", "bankTransferLast5", "confirmationEmailSentAt", "contactEmail", "contactName", "contactPhone", "createdAt", "depositAmountSnapshot", "depositModeSnapshot", "depositRequired", "discountAmountSnapshot", "discountModeSnapshot", "id", "memberCount", "orderNo", "paymentMethod", "paymentStatus", "pricePerPersonSnapshot", "receiptEmailSentAt", "subtotal", "totalDiscount", "totalDue", "tourId", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_orderNo_key" ON "Order"("orderNo");
CREATE TABLE "new_Tour" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "tourCode" TEXT,
    "departureCountry" TEXT NOT NULL,
    "departureDate" DATETIME NOT NULL,
    "days" INTEGER NOT NULL,
    "pricePerPerson" INTEGER NOT NULL,
    "discountAmount" INTEGER NOT NULL DEFAULT 0,
    "discountMode" TEXT NOT NULL DEFAULT 'FLAT_GROUP',
    "depositAmount" INTEGER NOT NULL,
    "depositMode" TEXT NOT NULL DEFAULT 'PER_PERSON',
    "chargeType" TEXT NOT NULL DEFAULT 'DEPOSIT',
    "peopleCount" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Tour" ("createdAt", "days", "departureCountry", "departureDate", "depositAmount", "depositMode", "discountAmount", "discountMode", "id", "isActive", "name", "peopleCount", "pricePerPerson", "tourCode", "updatedAt") SELECT "createdAt", "days", "departureCountry", "departureDate", "depositAmount", "depositMode", "discountAmount", "discountMode", "id", "isActive", "name", "peopleCount", "pricePerPerson", "tourCode", "updatedAt" FROM "Tour";
DROP TABLE "Tour";
ALTER TABLE "new_Tour" RENAME TO "Tour";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
