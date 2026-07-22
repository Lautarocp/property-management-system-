import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { LedgerModule } from '@/ledger/ledger.module';

@Module({
  imports: [PrismaModule, LedgerModule],
  controllers: [TenantsController],
  providers: [TenantsService],
})
export class TenantsModule {}
