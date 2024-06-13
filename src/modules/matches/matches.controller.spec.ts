import { Test, TestingModule } from '@nestjs/testing';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { LoggerService } from '../logger/logger.service';
import { CalculateAKOOddsDto } from './dto/odds.dto';
import { HttpException } from '@nestjs/common';

describe('MatchesController', () => {
  let controller: MatchesController;
  let service: MatchesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchesController],
      providers: [
        {
          provide: MatchesService,
          useValue: {
            getMatches: jest.fn(),
            getMatchesByLeague: jest.fn(),
            calculateAKOOddsForMatches: jest.fn(),
          },
        },
        LoggerService,
      ],
    }).compile();

    controller = module.get<MatchesController>(MatchesController);
    service = module.get<MatchesService>(MatchesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMatches', () => {
    it('should call getMatchesByLeague if league is provided', async () => {
      const league = 'Test League';
      const ip = '127.0.0.1';
      const mockMatches = [
        {
          id: 1,
          league,
          host: 'Team A',
          guest: 'Team B',
          date: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          odds: [],
        },
      ];
      jest.spyOn(service, 'getMatchesByLeague').mockResolvedValue(mockMatches);

      const result = await controller.getMatches(ip, league);

      expect(service.getMatchesByLeague).toHaveBeenCalledWith(league);
      expect(result).toBe(mockMatches);
    });

    it('should call getMatches if league is not provided', async () => {
      const ip = '127.0.0.1';
      const mockMatches = [
        {
          id: 1,
          league: 'League 1',
          host: 'Team A',
          guest: 'Team B',
          date: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          odds: [],
        },
        {
          id: 2,
          league: 'League 2',
          host: 'Team C',
          guest: 'Team D',
          date: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          odds: [],
        },
      ];
      jest.spyOn(service, 'getMatches').mockResolvedValue(mockMatches);

      const result = await controller.getMatches(ip, undefined);

      expect(service.getMatches).toHaveBeenCalled();
      expect(result).toBe(mockMatches);
    });
  });

  describe('calculateAKOOdds', () => {
    it('should return the calculated odds if successful', async () => {
      const calculateAKOOddsDto: CalculateAKOOddsDto = {
        selections: [
          { matchId: 1, betType: 'homeWin' },
          { matchId: 2, betType: 'draw' },
        ],
      };
      const ip = '127.0.0.1';
      const mockOdds = 2.5;
      jest
        .spyOn(service, 'calculateAKOOddsForMatches')
        .mockResolvedValue(mockOdds);

      const result = await controller.calculateAKOOdds(ip, calculateAKOOddsDto);

      expect(service.calculateAKOOddsForMatches).toHaveBeenCalledWith(
        calculateAKOOddsDto.selections,
      );
      expect(result).toEqual({ statusCode: 200, odds: mockOdds });
    });

    it('should throw an HttpException if an error occurs', async () => {
      const calculateAKOOddsDto: CalculateAKOOddsDto = {
        selections: [
          { matchId: 1, betType: 'homeWin' },
          { matchId: 2, betType: 'draw' },
        ],
      };
      const ip = '127.0.0.1';
      const mockError = {
        flag: null,
        message: 'No matches found for the given IDs.',
        statusCode: 404,
      };
      jest
        .spyOn(service, 'calculateAKOOddsForMatches')
        .mockResolvedValue(mockError);

      await expect(
        controller.calculateAKOOdds(ip, calculateAKOOddsDto),
      ).rejects.toThrow(
        new HttpException(mockError.message, mockError.statusCode),
      );
    });
  });
});
