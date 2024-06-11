-- CreateTable
CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "league" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "guest" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Odds" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "bookmaker" TEXT NOT NULL,
    "homeWin" DOUBLE PRECISION NOT NULL,
    "draw" DOUBLE PRECISION NOT NULL,
    "awayWin" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Odds_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Odds" ADD CONSTRAINT "Odds_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
