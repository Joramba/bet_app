import { Injectable } from '@nestjs/common';
import { Match, Odds } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class MatchesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createMatch(matchData: any): Promise<Match> {
    const { odds, ...match } = matchData;
    const createdMatch = await this.prisma.match.create({
      data: {
        ...match,
        odds: {
          create: odds,
        },
      },
      include: { odds: true },
    });
    return createdMatch;
  }

  async findMatches(): Promise<Match[]> {
    return this.prisma.match.findMany({
      include: { odds: true },
    });
  }

  async findMatchesByLeague(league: string): Promise<Match[]> {
    return this.prisma.match.findMany({
      where: {
        league,
      },
      include: { odds: true },
    });
  }
}
