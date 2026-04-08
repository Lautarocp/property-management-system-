import { Module } from '@nestjs/common';
import { LedgerModule } from '@/ledger/ledger.module';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';

@Module({
  imports: [LedgerModule],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
