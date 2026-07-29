-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "chineseName" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "passportEnglishName" TEXT,
    "passportNumber" TEXT,
    "passportExpiry" DATETIME,
    "specialDiet" TEXT,
    "passportFileId" TEXT,
    "roomNo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Member_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Member" ("chineseName", "createdAt", "id", "orderId", "passportEnglishName", "passportExpiry", "passportFileId", "passportNumber", "roomNo", "sortOrder", "specialDiet", "updatedAt") SELECT "chineseName", "createdAt", "id", "orderId", "passportEnglishName", "passportExpiry", "passportFileId", "passportNumber", "roomNo", "sortOrder", "specialDiet", "updatedAt" FROM "Member";
DROP TABLE "Member";
ALTER TABLE "new_Member" RENAME TO "Member";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
