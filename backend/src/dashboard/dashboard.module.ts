import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { LedgerModule } from '@/ledger/ledger.module';

@Module({
  imports: [PrismaModule, LedgerModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
