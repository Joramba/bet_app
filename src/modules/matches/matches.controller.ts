import { Controller, Get, Post, Body, Query, Ip } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { LoggerService } from '../logger/logger.service';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}
  private readonly logger = new LoggerService(MatchesController.name);

  @Post()
  async createMatch(@Ip() ip: string, @Body() createMatchDto: CreateMatchDto) {
    this.logger.log(`Create new match\t${ip}`, MatchesController.name);
    return this.matchesService.createMatch(createMatchDto);
  }

  @Get()
  async getMatches(@Ip() ip: string, @Query('league') league: string) {
    if (league) {
      this.logger.log(
        `Request for matches by ${league} league\t${ip}`,
        MatchesController.name,
      );
      return this.matchesService.getMatchesByLeague(league);
    }

    this.logger.log(`Request for all matches\t${ip}`, MatchesController.name);
    return this.matchesService.getMatches();
  }
}
