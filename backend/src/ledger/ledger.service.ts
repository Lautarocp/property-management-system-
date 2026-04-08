import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateLedgerEntryDto } from './dto/create-ledger-entry.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class LedgerService {
  constructor(private prisma: PrismaService) {}

  async writeEntry(dto: CreateLedgerEntryDto) {
    if (dto.amount <= 0) {
      throw new BadRequestException('Ledger entry amount must be greater than 0');
    }
    try {
      return await this.prisma.ledgerEntry.create({
        data: {
          type: dto.type,
          category: dto.category,
          direction: dto.direction,
          amount: dto.amount,
          description: dto.description,
          referenceId: dto.referenceId,
          referenceType: dto.referenceType,
          billingMonth: dto.billingMonth,
          tenantId: dto.tenantId,
          leaseId: dto.leaseId,
          apartmentId: dto.apartmentId,
        },
      });
    } catch (err: any) {
      // P2002 = unique constraint violation (idempotency guard for monthly rent)
      if (err?.code === 'P2002') {
        return null;
      }
      throw err;
    }
  }

  async getTenantBalance(tenantId: string) {
    const [debitResult, creditResult] = await Promise.all([
      this.prisma.ledgerEntry.aggregate({
        where: { tenantId, direction: 'DEBIT' },
        _sum: { amount: true },
      }),
      this.prisma.ledgerEntry.aggregate({
        where: { tenantId, direction: 'CREDIT' },
        _sum: { amount: true },
      }),
    ]);

    const totalCharged = debitResult._sum.amount ?? new Prisma.Decimal(0);
    const totalPaid = creditResult._sum.amount ?? new Prisma.Decimal(0);
    const balance = new Prisma.Decimal(totalCharged).minus(new Prisma.Decimal(totalPaid));

    return {
      balance: Number(balance),
      totalCharged: Number(totalCharged),
      totalPaid: Number(totalPaid),
    };
  }

  async getRevenueByMonth(complexId?: string) {
    const entries = await this.prisma.ledgerEntry.findMany({
      where: {
        direction: 'CREDIT',
        type: 'PAYMENT',
        ...(complexId && { apartment: { complexId } }),
      },
      select: { billingMonth: true, amount: true, createdAt: true },
    });

    const byMonth: Record<string, number> = {};
    for (const e of entries) {
      const month = e.billingMonth ?? e.createdAt.toISOString().slice(0, 7);
      byMonth[month] = (byMonth[month] ?? 0) + Number(e.amount);
    }

    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, total]) => ({ month, total }));
  }

  async getRevenueByComplex() {
    const entries = await this.prisma.ledgerEntry.findMany({
      where: { direction: 'CREDIT', type: 'PAYMENT' },
      include: { apartment: { include: { complex: { select: { id: true, name: true } } } } },
    });

    const byComplex: Record<string, { complexId: string; complexName: string; total: number }> = {};
    for (const e of entries) {
      const { id, name } = e.apartment.complex;
      if (!byComplex[id]) byComplex[id] = { complexId: id, complexName: name, total: 0 };
      byComplex[id].total += Number(e.amount);
    }

    return Object.values(byComplex);
  }

  async getOutstandingBalances() {
    const tenants = await this.prisma.tenant.findMany({
      where: { isActive: true, ledgerEntries: { some: {} } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        ledgerEntries: { select: { direction: true, amount: true } },
      },
    });

    return tenants
      .map((t) => {
        const totalCharged = t.ledgerEntries
          .filter((e) => e.direction === 'DEBIT')
          .reduce((sum, e) => sum + Number(e.amount), 0);
        const totalPaid = t.ledgerEntries
          .filter((e) => e.direction === 'CREDIT')
          .reduce((sum, e) => sum + Number(e.amount), 0);
        return {
          tenantId: t.id,
          firstName: t.firstName,
          lastName: t.lastName,
          balance: totalCharged - totalPaid,
        };
      })
      .filter((t) => t.balance > 0)
      .sort((a, b) => b.balance - a.balance);
  }

  async getMaintenanceCostTotals(complexId?: string, from?: Date, to?: Date) {
    const result = await this.prisma.maintenanceRequest.aggregate({
      where: {
        ...(complexId && { apartment: { complexId } }),
        ...(from || to
          ? { createdAt: { ...(from && { gte: from }), ...(to && { lte: to }) } }
          : {}),
        repairCost: { not: null },
      },
      _sum: { repairCost: true },
    });
    return Number(result._sum.repairCost ?? 0);
  }

  async getExpenseTotalsByCategory(complexId?: string) {
    const groups = await this.prisma.expense.groupBy({
      by: ['category'],
      where: complexId ? { complexId } : undefined,
      _sum: { amount: true },
    });
    return groups.map((g) => ({ category: g.category, total: Number(g._sum.amount ?? 0) }));
  }

  async getFinancialSummary(complexId?: string) {
    const [totalRevenue, totalCharges, expenseGroups] = await Promise.all([
      this.prisma.ledgerEntry.aggregate({
        where: {
          direction: 'CREDIT',
          type: 'PAYMENT',
          ...(complexId && { apartment: { complexId } }),
        },
        _sum: { amount: true },
      }),
      this.prisma.ledgerEntry.aggregate({
        where: {
          direction: 'DEBIT',
          type: 'CHARGE',
          ...(complexId && { apartment: { complexId } }),
        },
        _sum: { amount: true },
      }),
      this.prisma.expense.aggregate({
        where: complexId ? { complexId } : undefined,
        _sum: { amount: true },
      }),
    ]);

    const revenue = Number(totalRevenue._sum.amount ?? 0);
    const charges = Number(totalCharges._sum.amount ?? 0);
    const expenses = Number(expenseGroups._sum.amount ?? 0);

    return {
      totalRevenue: revenue,
      totalCharges: charges,
      totalOutstanding: charges - revenue,
      totalExpenses: expenses,
    };
  }
}
