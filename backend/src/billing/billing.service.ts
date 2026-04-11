import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { LedgerService } from '@/ledger/ledger.service';

@Injectable()
export class BillingService {
  constructor(
    private prisma: PrismaService,
    private ledger: LedgerService,
  ) {}

  async generateMonthlyRent(targetMonth?: string): Promise<{ created: number; skipped: number }> {
    const month = targetMonth ?? new Date().toISOString().slice(0, 7);

    const activeLeases = await this.prisma.lease.findMany({
      where: { status: 'ACTIVE' },
      include: { apartment: { select: { id: true, complexId: true } } },
    });

    let created = 0;
    let skipped = 0;

    for (const lease of activeLeases) {
      const result = await this.ledger.writeEntry({
        type: 'CHARGE',
        category: 'RENT',
        direction: 'DEBIT',
        amount: Number(lease.monthlyRent),
        description: `Monthly rent — ${month}`,
        referenceId: lease.id,
        referenceType: 'Lease',
        billingMonth: month,
        tenantId: lease.tenantId,
        leaseId: lease.id,
        apartmentId: lease.apartment.id,
      });

      if (result === null) {
        skipped++;
      } else {
        // Also create a PENDING payment so the user can mark it as paid from the UI
        const dueDate = new Date(`${month}-01`);
        dueDate.setMonth(dueDate.getMonth() + 1); // due end of the billing month
        await this.prisma.payment.upsert({
          where: { id: `rent-${lease.id}-${month}` },
          create: {
            id: `rent-${lease.id}-${month}`,
            leaseId: lease.id,
            tenantId: lease.tenantId,
            amount: Number(lease.monthlyRent),
            dueDate,
            type: 'RENT',
            status: 'PENDING',
            notes: `Monthly rent — ${month}`,
          },
          update: {},
        });
        created++;
      }
    }

    return { created, skipped };
  }
}
