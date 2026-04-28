import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { LedgerService } from '@/ledger/ledger.service';

@Injectable()
export class BillingService {
  constructor(
    private prisma: PrismaService,
    private ledger: LedgerService,
  ) {}

  // Returns outstanding (unpaid) amounts per tenant grouped by category.
  // Uses existing ledger entries: net = DEBIT - CREDIT per category.
  private async getOutstandingItems(
    tenantIds: string[],
  ): Promise<Map<string, { label: string; amount: number; category: string }[]>> {
    const entries = await this.prisma.ledgerEntry.findMany({
      where: {
        tenantId: { in: tenantIds },
        category: { notIn: ['RENT', 'DEPOSIT'] },
      },
      select: { tenantId: true, category: true, direction: true, amount: true, description: true },
    });

    type Agg = { debit: number; credit: number; descriptions: string[] };
    const agg = new Map<string, Map<string, Agg>>();

    for (const e of entries) {
      if (!agg.has(e.tenantId)) agg.set(e.tenantId, new Map());
      const byCategory = agg.get(e.tenantId)!;
      if (!byCategory.has(e.category)) byCategory.set(e.category, { debit: 0, credit: 0, descriptions: [] });
      const cat = byCategory.get(e.category)!;
      if (e.direction === 'DEBIT') {
        cat.debit += Number(e.amount);
        if (e.description) cat.descriptions.push(e.description);
      } else {
        cat.credit += Number(e.amount);
      }
    }

    const categoryLabels: Record<string, string> = {
      MAINTENANCE: 'Mantenimiento pendiente',
      EXTRA: 'Expensas/Impuestos pendientes',
      BUILDING_FEE: 'Expensas comunes pendientes',
      ADJUSTMENT: 'Ajuste pendiente',
    };

    const result = new Map<string, { label: string; amount: number; category: string }[]>();
    for (const [tenantId, byCategory] of agg) {
      const items: { label: string; amount: number; category: string }[] = [];
      for (const [category, { debit, credit, descriptions }] of byCategory) {
        const outstanding = Math.round((debit - credit) * 100) / 100;
        if (outstanding > 0) {
          const label = descriptions.length === 1 ? descriptions[0] : (categoryLabels[category] ?? category);
          items.push({ label, amount: outstanding, category });
        }
      }
      if (items.length > 0) result.set(tenantId, items);
    }
    return result;
  }

  async generateMonthlyRent(
    targetMonth?: string,
    includeOutstanding = false,
  ): Promise<{ created: number; skipped: number }> {
    const month = targetMonth ?? new Date().toISOString().slice(0, 7);

    const monthStart = new Date(`${month}-01T00:00:00.000Z`);
    const monthEnd = new Date(monthStart);
    monthEnd.setUTCMonth(monthEnd.getUTCMonth() + 1);

    const activeLeases = await this.prisma.lease.findMany({
      where: { status: 'ACTIVE' },
      include: { apartment: { select: { id: true, complexId: true } } },
    });

    // Count active leases per complex for expense apportionment
    const leasesPerComplex = new Map<string, number>();
    for (const lease of activeLeases) {
      const cid = lease.apartment.complexId;
      leasesPerComplex.set(cid, (leasesPerComplex.get(cid) ?? 0) + 1);
    }

    // Fetch and aggregate expenses (non-tax) by complex for billing month
    const monthExpenses = await this.prisma.expense.findMany({
      where: { date: { gte: monthStart, lt: monthEnd }, category: { not: 'TAXES' } },
      select: { complexId: true, amount: true },
    });
    const expensesByComplex = new Map<string, number>();
    for (const e of monthExpenses) {
      expensesByComplex.set(e.complexId, (expensesByComplex.get(e.complexId) ?? 0) + Number(e.amount));
    }

    // Fetch and aggregate tax expenses by complex for billing month
    const monthTaxes = await this.prisma.expense.findMany({
      where: { date: { gte: monthStart, lt: monthEnd }, category: 'TAXES' },
      select: { complexId: true, amount: true },
    });
    const taxesByComplex = new Map<string, number>();
    for (const t of monthTaxes) {
      taxesByComplex.set(t.complexId, (taxesByComplex.get(t.complexId) ?? 0) + Number(t.amount));
    }

    // Fetch maintenance charges resolved this month, grouped by apartment
    const allApartmentIds = activeLeases.map((l) => l.apartment.id);
    const maintenanceRequests = await this.prisma.maintenanceRequest.findMany({
      where: {
        apartmentId: { in: allApartmentIds },
        tenantChargeAmount: { gt: 0 },
        resolvedAt: { gte: monthStart, lt: monthEnd },
      },
    });
    const maintenanceByApartment = new Map<string, typeof maintenanceRequests>();
    for (const r of maintenanceRequests) {
      if (!maintenanceByApartment.has(r.apartmentId)) maintenanceByApartment.set(r.apartmentId, []);
      maintenanceByApartment.get(r.apartmentId)!.push(r);
    }

    // Pre-fetch outstanding balances if requested
    const outstandingByTenant = includeOutstanding
      ? await this.getOutstandingItems(activeLeases.map((l) => l.tenantId))
      : new Map<string, { label: string; amount: number; category: string }[]>();

    let created = 0;
    let skipped = 0;

    const dueDate = new Date(`${month}-01`);
    dueDate.setMonth(dueDate.getMonth() + 1);

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
        // Build outstanding items to include in the rent payment
        const outstandingItems = outstandingByTenant.get(lease.tenantId) ?? [];
        const outstandingTotal = outstandingItems.reduce((sum, i) => sum + i.amount, 0);
        const totalRentAmount = Number(lease.monthlyRent) + outstandingTotal;

        // When there are outstanding items, itemize the payment for clarity.
        // ledgerCategory is stored per item so markAsPaid can credit the right category.
        const paymentItems =
          outstandingItems.length > 0
            ? [
                { name: `Alquiler ${month}`, amount: Number(lease.monthlyRent), ledgerCategory: 'RENT' },
                ...outstandingItems.map((o) => ({ name: o.label, amount: o.amount, ledgerCategory: o.category })),
              ]
            : [];

        await this.prisma.payment.upsert({
          where: { id: `rent-${lease.id}-${month}` },
          create: {
            id: `rent-${lease.id}-${month}`,
            leaseId: lease.id,
            tenantId: lease.tenantId,
            amount: totalRentAmount,
            dueDate,
            type: 'RENT',
            status: 'PENDING',
            notes: `Monthly rent — ${month}`,
            ...(paymentItems.length > 0 && { items: { create: paymentItems } }),
          },
          update: {},
        });
        created++;
      }

      // ── Expensas e impuestos (prorrateados por inquilinos del complejo) ────
      const complexId = lease.apartment.complexId;
      const complexLeaseCount = leasesPerComplex.get(complexId) ?? 1;
      const expensesShare = (expensesByComplex.get(complexId) ?? 0) / complexLeaseCount;
      const taxesShare = (taxesByComplex.get(complexId) ?? 0) / complexLeaseCount;
      const expensesPlusTaxes = expensesShare + taxesShare;

      if (expensesPlusTaxes > 0) {
        const extraResult = await this.ledger.writeEntry({
          type: 'CHARGE',
          category: 'EXTRA',
          direction: 'DEBIT',
          amount: expensesPlusTaxes,
          description: `Expensas e impuestos — ${month}`,
          referenceId: lease.id,
          referenceType: 'Lease',
          billingMonth: month,
          tenantId: lease.tenantId,
          leaseId: lease.id,
          apartmentId: lease.apartment.id,
        });

        if (extraResult !== null) {
          const items: { name: string; amount: number }[] = [];
          if (expensesShare > 0) items.push({ name: 'Expensas', amount: expensesShare });
          if (taxesShare > 0) items.push({ name: 'Impuestos', amount: taxesShare });

          await this.prisma.payment.upsert({
            where: { id: `extra-${lease.id}-${month}` },
            create: {
              id: `extra-${lease.id}-${month}`,
              leaseId: lease.id,
              tenantId: lease.tenantId,
              amount: expensesPlusTaxes,
              dueDate,
              type: 'OTHER',
              status: 'PENDING',
              notes: `Expensas e impuestos — ${month}`,
              items: { create: items },
            },
            update: {},
          });
        }
      }

      // ── Mantenimiento (cargo al inquilino por reparaciones del mes) ────────
      const apartmentMaintenance = maintenanceByApartment.get(lease.apartment.id) ?? [];
      const maintenanceTotal = apartmentMaintenance.reduce(
        (sum, r) => sum + Number(r.tenantChargeAmount ?? 0),
        0,
      );

      if (maintenanceTotal > 0) {
        const maintResult = await this.ledger.writeEntry({
          type: 'CHARGE',
          category: 'MAINTENANCE',
          direction: 'DEBIT',
          amount: maintenanceTotal,
          description: `Mantenimiento — ${month}`,
          referenceId: lease.id,
          referenceType: 'Lease',
          billingMonth: month,
          tenantId: lease.tenantId,
          leaseId: lease.id,
          apartmentId: lease.apartment.id,
        });

        if (maintResult !== null) {
          await this.prisma.payment.upsert({
            where: { id: `maint-${lease.id}-${month}` },
            create: {
              id: `maint-${lease.id}-${month}`,
              leaseId: lease.id,
              tenantId: lease.tenantId,
              amount: maintenanceTotal,
              dueDate,
              type: 'MAINTENANCE',
              status: 'PENDING',
              notes: `Mantenimiento — ${month}`,
              items: {
                create: apartmentMaintenance.map((r) => ({
                  name: r.title,
                  amount: Number(r.tenantChargeAmount),
                })),
              },
            },
            update: {},
          });
        }
      }
    }

    return { created, skipped };
  }
}
