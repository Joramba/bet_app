import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { MatchesRepository } from './matches.repository';
import { CreateMatchDto } from './dto/create-match.dto';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class MatchesService {
  constructor(
    private readonly matchesRepository: MatchesRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  private readonly logger = new LoggerService(MatchesService.name);

  async createMatch(createMatchDto: CreateMatchDto) {
    const result = await this.matchesRepository.createMatch(createMatchDto);
    await this.cacheManager.reset(); // Clear cache on data mutation
    this.logger.log(
      'Cache reset after creating a new match',
      MatchesService.name,
    );
    return result;
  }

  async getMatches() {
    const cacheKey = 'allMatches';
    this.logger.log(
      `Attempting to retrieve key ${cacheKey} from cache`,
      MatchesService.name,
    );
    let matches = await this.cacheManager.get(cacheKey);
    if (matches) {
      this.logger.log('Retrieved all matches from cache', MatchesService.name);
    } else {
      this.logger.log(
        'Cache miss for all matches, querying database',
        MatchesService.name,
      );
      matches = await this.matchesRepository.findMatches();
      this.logger.log(`Storing key ${cacheKey} in cache`, MatchesService.name);
      await this.cacheManager.set(cacheKey, matches, 60000);
      this.logger.log('Stored all matches in cache', MatchesService.name);
    }
    return matches;
  }

  async getMatchesByLeague(league: string) {
    const cacheKey = `matchesByLeague_${league.trim()}`;
    this.logger.log(
      `Attempting to retrieve key ${cacheKey} from cache`,
      MatchesService.name,
    );
    let matches = await this.cacheManager.get(cacheKey);
    if (matches) {
      this.logger.log(
        `Retrieved matches for league ${league} from cache`,
        MatchesService.name,
      );
    } else {
      this.logger.log(
        `Cache miss for league ${league}, querying database`,
        MatchesService.name,
      );
      matches = await this.matchesRepository.findMatchesByLeague(league);
      this.logger.log(`Storing key ${cacheKey} in cache`, MatchesService.name);
      await this.cacheManager.set(cacheKey, matches, 60000);
      this.logger.log(
        `Stored matches for league ${league} in cache`,
        MatchesService.name,
      );
    }
    return matches;
  }

  async calculateAKOOddsForMatches(
    selections: { matchId: number; betType: 'homeWin' | 'draw' | 'awayWin' }[],
  ): Promise<number | Result> {
    const matchIds = selections.map((selection) => selection.matchId);

    this.logger.log(
      `Request for matches by ids: ${matchIds}`,
      MatchesService.name,
    );
    const matches = await this.matchesRepository.findMatchesByIds(matchIds);

    if (matches.length === 0) {
      return {
        flag: null,
        message: 'No matches found for the given IDs.',
        statusCode: 404,
      };
    }

    const seenMatchIds = new Set<number>();

    let akoOdds = 1;

    for (const selection of selections) {
      if (seenMatchIds.has(selection.matchId)) {
        return {
          flag: null,
          message: `Multiple selections on match with ID ${selection.matchId} are not allowed.`,
          statusCode: 400,
        };
      }

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
      seenMatchIds.add(selection.matchId);
    }

    return akoOdds;
  }
}
