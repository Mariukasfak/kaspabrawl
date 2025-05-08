-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "address" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "FightLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerAId" TEXT NOT NULL,
    "playerBId" TEXT NOT NULL,
    "log" JSONB NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FightLog_playerAId_fkey" FOREIGN KEY ("playerAId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FightLog_playerBId_fkey" FOREIGN KEY ("playerBId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NFTItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerAddress" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    CONSTRAINT "NFTItem_ownerAddress_fkey" FOREIGN KEY ("ownerAddress") REFERENCES "User" ("address") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_address_key" ON "User"("address");
