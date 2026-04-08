import { Injectable } from '@nestjs/common';
import { LedgerService } from '@/ledger/ledger.service';

@Injectable()
export class ReportsService {
  constructor(private ledger: LedgerService) {}

  getRevenueByMonth(complexId?: string) {
    return this.ledger.getRevenueByMonth(complexId);
  }

  getRevenueByComplex() {
    return this.ledger.getRevenueByComplex();
  }

  getOutstandingBalances() {
    return this.ledger.getOutstandingBalances();
  }

  getMaintenanceCostTotals(complexId?: string, from?: string, to?: string) {
    return this.ledger.getMaintenanceCostTotals(
      complexId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }

  getExpenseTotalsByCategory(complexId?: string) {
    return this.ledger.getExpenseTotalsByCategory(complexId);
  }
}
