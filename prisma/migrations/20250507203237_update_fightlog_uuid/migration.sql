/*
  Warnings:

  - You are about to drop the column `timestamp` on the `FightLog` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FightLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerAId" TEXT NOT NULL,
    "playerBId" TEXT NOT NULL,
    "log" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FightLog_playerAId_fkey" FOREIGN KEY ("playerAId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FightLog_playerBId_fkey" FOREIGN KEY ("playerBId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FightLog" ("id", "log", "playerAId", "playerBId") SELECT "id", "log", "playerAId", "playerBId" FROM "FightLog";
DROP TABLE "FightLog";
ALTER TABLE "new_FightLog" RENAME TO "FightLog";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
