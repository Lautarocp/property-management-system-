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

    const dueDate = new Date(`${month}-01`);
    dueDate.setMonth(dueDate.getMonth() + 1); // due end of the billing month

    for (const lease of activeLeases) {
      // ── Rent charge ────────────────────────────────────────────────────────
      const rentResult = await this.ledger.writeEntry({
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

      if (rentResult === null) {
        skipped++;
      } else {
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

      // ── Building fee charge (optional) ────────────────────────────────────
      if (lease.buildingFeeAmount && Number(lease.buildingFeeAmount) > 0) {
        const feeResult = await this.ledger.writeEntry({
          type: 'CHARGE',
          category: 'BUILDING_FEE',
          direction: 'DEBIT',
          amount: Number(lease.buildingFeeAmount),
          description: `Building fee — ${month}`,
          referenceId: lease.id,
          referenceType: 'Lease',
          billingMonth: month,
          tenantId: lease.tenantId,
          leaseId: lease.id,
          apartmentId: lease.apartment.id,
        });

        if (feeResult !== null) {
          await this.prisma.payment.upsert({
            where: { id: `fee-${lease.id}-${month}` },
            create: {
              id: `fee-${lease.id}-${month}`,
              leaseId: lease.id,
              tenantId: lease.tenantId,
              amount: Number(lease.buildingFeeAmount),
              dueDate,
              type: 'BUILDING_FEE',
              status: 'PENDING',
              notes: `Building fee — ${month}`,
            },
            update: {},
          });
        }
      }
    }

    return { created, skipped };
  }
}
