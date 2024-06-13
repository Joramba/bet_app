import { Injectable } from '@nestjs/common';
import { MatchesRepository } from './matches.repository';
import { CreateMatchDto } from './dto/create-match.dto';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class MatchesService {
  constructor(private readonly matchesRepository: MatchesRepository) {}
  private readonly logger = new LoggerService(MatchesRepository.name);

  async createMatch(createMatchDto: CreateMatchDto) {
    return this.matchesRepository.createMatch(createMatchDto);
  }

  async getMatches() {
    return this.matchesRepository.findMatches();
  }

  async getMatchesByLeague(league: string) {
    return this.matchesRepository.findMatchesByLeague(league);
  }

  async calculateAKOOddsForMatches(
    selections: { matchId: number; betType: 'homeWin' | 'draw' | 'awayWin' }[],
  ): Promise<number | Result> {
    const matchIds = selections.map((selection) => selection.matchId);

    this.logger.log(
      `Request for matches by ids: ${matchIds}\t`,
      MatchesRepository.name,
    );
    const matches = await this.matchesRepository.findMatchesByIds(matchIds);

    if (matches.length === 0) {
      return {
        flag: null,
        message: 'No matches found for the given IDs.',
        statusCode: 404,
      };
    }

    let akoOdds = 1;

    for (const selection of selections) {
      const match = matches.find((m) => m.id === selection.matchId);

      if (!match) {
        return {
          flag: null,
          message: `Match with ID ${selection.matchId} not found.`,
          statusCode: 404,
        };
      }

      if (!match.odds || match.odds.length === 0) {
        return {
          flag: null,
          message: `No odds available for match with ID ${selection.matchId}.`,
          statusCode: 404,
        };
      }

      const odds = match.odds[0][selection.betType];

      if (odds === null || odds === undefined) {
        return {
          flag: null,
          message: `Odds not available for the selected bet type in match with ID ${selection.matchId}.`,
          statusCode: 400,
        };
      }

      akoOdds *= odds;
    }

    return akoOdds;
  }
}
