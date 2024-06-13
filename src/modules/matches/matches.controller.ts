import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Ip,
  HttpException,
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { LoggerService } from '../logger/logger.service';
import { CalculateAKOOddsDto } from './dto/odds.dto';

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

  @Post('calculate-ako-odds')
  async calculateAKOOdds(
    @Ip() ip: string,
    @Body() calculateAKOOddsDto: CalculateAKOOddsDto,
  ) {
    this.logger.log(
      `Calculate Odds For Matches\t${ip}`,
      MatchesController.name,
    );

    const result = await this.matchesService.calculateAKOOddsForMatches(
      calculateAKOOddsDto.selections,
    );

    if (typeof result === 'number') {
      return { statusCode: 200, odds: result };
    } else {
      throw new HttpException(result.message, result.statusCode);
    }
  }
}
