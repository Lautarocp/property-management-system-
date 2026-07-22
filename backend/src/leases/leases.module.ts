import { Module } from '@nestjs/common';
import { LeasesService } from './leases.service';
import { LeasesController } from './leases.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { LedgerModule } from '@/ledger/ledger.module';

@Module({
  imports: [PrismaModule, LedgerModule],
  controllers: [LeasesController],
  providers: [LeasesService],
})
export class LeasesModule {}
