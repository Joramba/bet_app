import {
  IsString,
  IsDate,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class OddsDto {
  @IsString()
  bookmaker: string;

  @IsNumber()
  homeWin: number;

  @IsNumber()
  draw: number;

  @IsNumber()
  awayWin: number;
}

export class CreateMatchDto {
  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsString()
  league: string;

  @IsString()
  host: string;

  @IsString()
  guest: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OddsDto)
  odds: OddsDto[];
}
