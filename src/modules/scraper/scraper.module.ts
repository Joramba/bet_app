import { Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [ScraperService],
})
export class ScraperModule {}
