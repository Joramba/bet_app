import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { MatchesRepository } from './matches.repository';
import { DatabaseModule } from '../database/database.module';
import { PrismaService } from 'src/common/prisma.service';

@Module({
  imports: [DatabaseModule],
  controllers: [MatchesController],
  providers: [MatchesService, MatchesRepository, PrismaService],
  exports: [MatchesService, MatchesRepository],
})
export class MatchesModule {}
