-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FightLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerAId" TEXT NOT NULL,
    "playerBId" TEXT NOT NULL,
    "log" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FightLog_playerAId_fkey" FOREIGN KEY ("playerAId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FightLog_playerBId_fkey" FOREIGN KEY ("playerBId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FightLog" ("id", "log", "playerAId", "playerBId", "timestamp") SELECT "id", "log", "playerAId", "playerBId", "timestamp" FROM "FightLog";
DROP TABLE "FightLog";
ALTER TABLE "new_FightLog" RENAME TO "FightLog";
CREATE TABLE "new_NFTItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerAddress" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    CONSTRAINT "NFTItem_ownerAddress_fkey" FOREIGN KEY ("ownerAddress") REFERENCES "User" ("address") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_NFTItem" ("id", "metadata", "ownerAddress") SELECT "id", "metadata", "ownerAddress" FROM "NFTItem";
DROP TABLE "NFTItem";
ALTER TABLE "new_NFTItem" RENAME TO "NFTItem";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
