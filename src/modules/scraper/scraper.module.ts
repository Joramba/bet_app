import { Module, OnModuleInit } from '@nestjs/common';
import * as cron from 'node-cron';
import { ScraperService } from './scraper.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [ScraperService],
})
export class ScraperModule implements OnModuleInit {
  constructor(private readonly scraperService: ScraperService) {}

  onModuleInit() {
    // Schedule the scraper to run every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
      await this.scraperService.scrapeOdds();
    });
  }
}
