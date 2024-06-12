import { Match as MatchModel } from '@prisma/client';

export class MatchEntity implements MatchModel {
  id: number;
  date: Date;
  league: string;
  host: string;
  guest: string;
  createdAt: Date;
  updatedAt: Date;
}
