-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tour" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "tourCode" TEXT,
    "departureCountry" TEXT,
    "departureDate" DATETIME NOT NULL,
    "days" INTEGER,
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
INSERT INTO "new_Tour" ("chargeType", "createdAt", "days", "departureCountry", "departureDate", "depositAmount", "depositMode", "discountAmount", "discountMode", "id", "isActive", "name", "peopleCount", "pricePerPerson", "tourCode", "updatedAt") SELECT "chargeType", "createdAt", "days", "departureCountry", "departureDate", "depositAmount", "depositMode", "discountAmount", "discountMode", "id", "isActive", "name", "peopleCount", "pricePerPerson", "tourCode", "updatedAt" FROM "Tour";
DROP TABLE "Tour";
ALTER TABLE "new_Tour" RENAME TO "Tour";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
