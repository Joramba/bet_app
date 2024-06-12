import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MatchesModule } from './modules/matches/matches.module';
import { ScraperModule } from './modules/scraper/scraper.module';
import { PrismaService } from './common/prisma.service';
import { LoggerModule } from './modules/logger/logger.module';

@Module({
  imports: [ConfigModule.forRoot(), MatchesModule, ScraperModule, LoggerModule],
  providers: [PrismaService],
})
export class AppModule {}
