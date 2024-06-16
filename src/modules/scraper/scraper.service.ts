import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import * as cheerio from 'cheerio';
import * as puppeteer from 'puppeteer';
import { PrismaService } from '../../common/prisma.service';
import { LoggerService } from '../logger/logger.service';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class ScraperService implements OnModuleInit {
  private readonly logger = new LoggerService(ScraperService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async onModuleInit() {
    await this.scrapeOdds();
  }

  async scrapeOdds() {
    try {
      await this.prisma.odds.deleteMany({});
      await this.prisma.match.deleteMany({});
      await this.cacheManager.reset();

      await this.prisma
        .$executeRaw`TRUNCATE TABLE "Odds" RESTART IDENTITY CASCADE`;
      this.logger.log(`Clear data from table 'Odds'`, ScraperService.name);

      await this.prisma
        .$executeRaw`TRUNCATE TABLE "Match" RESTART IDENTITY CASCADE`;
      this.logger.log(`Clear data from table 'Match'`, ScraperService.name);

      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto('https://www.flashscore.pl/', {
        waitUntil: 'networkidle2',
      });

      await page.evaluate(() => {
        const xpath = "//div[contains(text(), 'Następne')]";
        const result = document.evaluate(
          xpath,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null,
        );
        const element = result.singleNodeValue as HTMLElement;
        if (element) {
          element.click();
        } else {
          throw new Error('Button "Następne" do not found');
        }
      });

      await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        buttons.forEach((button) => {
          const path = button.querySelector(
            'path.action-navigation-arrow-down',
          );
          if (path) {
            (button as HTMLElement).click();
          }
        });
      });

      const content = await page.content();
      const $ = cheerio.load(content);

      const matchElements = $('.event__match');

      for (let index = 0; index < matchElements.length; index++) {
        const element = matchElements[index];

        let parentLeagueHeader = $(element).closest('.wclLeagueHeader');
        if (parentLeagueHeader.length === 0) {
          parentLeagueHeader = $(element)
            .closest('.event__match')
            .prevAll('.wclLeagueHeader')
            .first();
        }

        if (parentLeagueHeader.length === 0) {
          continue;
        }

        const leagueRegionElement = parentLeagueHeader.find(
          '.event__titleBox > span',
        );
        const leagueNameElement = parentLeagueHeader.find(
          '.event__titleBox > a',
        );

        const leagueRegion = leagueRegionElement.length
          ? leagueRegionElement.text().trim()
          : 'Unknown Region';
        const leagueName = leagueNameElement.length
          ? leagueNameElement.text().trim()
          : 'Unknown League';

        const host = $(element).find('.event__homeParticipant').text().trim();
        const guest = $(element).find('.event__awayParticipant').text().trim();

        const league = `${leagueRegion} ${leagueName}`;

        const [newPage] = await Promise.all([
          new Promise<puppeteer.Page>((resolve) =>
            browser.once('targetcreated', async (target) => {
              const page = await target.page();
              if (page) {
                resolve(page);
              }
            }),
          ),
          page.evaluate((index) => {
            const link = document.querySelectorAll('.event__match a')[
              index
            ] as HTMLElement;

            if (link) {
              link.click();
            }
          }, index),
        ]);

        if (!newPage) {
          this.logger.error(`Failed to open new page for match index ${index}`);
          continue;
        }

        await newPage.bringToFront();
        await newPage.waitForSelector('.oddsRowContent', { timeout: 5000 });

        const matchPageContent = await newPage.content();

        const matchPage = cheerio.load(matchPageContent);

        const odds = [];

        const dateText = matchPage('.duelParticipant__startTime').text().trim();
        const date = this.parseDate(dateText);

        if (date <= new Date()) {
          this.logger.log(
            `Skipping match: League: ${league}, Host: ${host}, Guest: ${guest} because it has already started or finished.`,
            ScraperService.name,
          );
          await newPage.close();
          continue;
        }

        matchPage('.oddsRowContent').each((i, el) => {
          const bookmaker =
            matchPage(el).find('.bookmaker a').attr('title')?.trim() ||
            'Unknown Bookmaker';

          const homeWinText = matchPage(el)
            .find('.cell.o_1 .oddsValueInner')
            .text()
            .trim();

          const homeWin = parseFloat(homeWinText);
          const validHomeWin = isNaN(homeWin) ? null : homeWin;

          const drawText = matchPage(el)
            .find('.cell.o_0 .oddsValueInner')
            .text()
            .trim();
          const draw = parseFloat(drawText);
          const validDraw = isNaN(draw) ? null : draw;

          const awayWinText = matchPage(el)
            .find('.cell.o_2 .oddsValueInner')
            .text()
            .trim();
          const awayWin = parseFloat(awayWinText);
          const validAwayWin = isNaN(awayWin) ? null : awayWin;

          if (
            bookmaker &&
            (validHomeWin !== null ||
              validDraw !== null ||
              validAwayWin !== null)
          ) {
            odds.push({
              bookmaker,
              homeWin: validHomeWin,
              draw: validDraw,
              awayWin: validAwayWin,
            });
          }
        });

        this.logger.log(
          `Create new match: League: ${league}, Host: ${host}, Guest: ${guest}'`,
          ScraperService.name,
        );

        await this.prisma.match.create({
          data: {
            date,
            league,
            host,
            guest,
            odds: {
              create: odds,
            },
          },
          include: { odds: true },
        });

        await newPage.close();
      }

      this.logger.log('Scraping completed successfully', ScraperService.name);
    } catch (error) {
      this.logger.error('Error while scraping odds', ScraperService.name);
    }
  }

  parseDate(dateString: string): Date {
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('.').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);

    return new Date(year, month - 1, day, hours, minutes);
  }
}
