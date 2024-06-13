declare type MatchWithOdds = Match & {
  odds: Odds[];
};

declare interface Match {
  id: number;
  date: Date;
  league: string;
  host: string;
  guest: string;
  createdAt: Date;
  updatedAt: Date;
}

declare interface Odds {
  bookmaker: string;
  homeWin: number;
  draw: number;
  awayWin: number;
}
