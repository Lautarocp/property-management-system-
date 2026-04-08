import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { LedgerModule } from '@/ledger/ledger.module';

@Module({
  imports: [PrismaModule, LedgerModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
