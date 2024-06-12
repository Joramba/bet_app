import { Injectable } from '@nestjs/common';
import { MatchesRepository } from './matches.repository';
import { CreateMatchDto } from './dto/create-match.dto';

@Injectable()
export class MatchesService {
  constructor(private readonly matchesRepository: MatchesRepository) {}

  async createMatch(createMatchDto: CreateMatchDto) {
    return this.matchesRepository.createMatch(createMatchDto);
  }

  async getMatches() {
    return this.matchesRepository.findMatches();
  }

  async getMatchesByLeague(league: string) {
    return this.matchesRepository.findMatchesByLeague(league);
  }
}
