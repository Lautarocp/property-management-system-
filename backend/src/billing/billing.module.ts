import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { LedgerModule } from '@/ledger/ledger.module';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';

@Module({
  imports: [PrismaModule, LedgerModule],
  providers: [BillingService],
  controllers: [BillingController],
})
export class BillingModule {}
