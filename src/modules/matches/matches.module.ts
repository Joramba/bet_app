import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { MatchesRepository } from './matches.repository';
import { DatabaseModule } from '../database/database.module';
import { PrismaService } from 'src/common/prisma.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    DatabaseModule,
    CacheModule.register({
      ttl: 60,
      max: 100,
    }),
  ],
  controllers: [MatchesController],
  providers: [MatchesService, MatchesRepository, PrismaService],
  exports: [MatchesService, MatchesRepository],
})
export class MatchesModule {}
