import { IsArray, IsIn, IsInt, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SelectionDto {
  @IsInt()
  matchId: number;

  @IsIn(['homeWin', 'draw', 'awayWin'])
  betType: 'homeWin' | 'draw' | 'awayWin';
}

export class CalculateAKOOddsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectionDto)
  selections: SelectionDto[];
}
