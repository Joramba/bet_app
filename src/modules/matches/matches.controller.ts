import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  async createMatch(@Body() createMatchDto: CreateMatchDto) {
    return this.matchesService.createMatch(createMatchDto);
  }

  @Get()
  async getMatches(@Query('league') league: string) {
    if (league) {
      return this.matchesService.getMatchesByLeague(league);
    }
    return this.matchesService.getMatches();
  }
}
