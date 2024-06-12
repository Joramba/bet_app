import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MatchesModule } from './modules/matches/matches.module';
import { ScraperModule } from './modules/scraper/scraper.module';
import { PrismaService } from './common/prisma.service';

@Module({
  imports: [ConfigModule.forRoot(), MatchesModule, ScraperModule],
  providers: [PrismaService],
})
export class AppModule {}
