import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { LedgerService } from '@/ledger/ledger.service';
import { ExpenseCategory } from '@prisma/client';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    private prisma: PrismaService,
    private ledger: LedgerService,
  ) {}

  async findAll(complexId?: string, category?: ExpenseCategory) {
    return this.prisma.expense.findMany({
      where: {
        ...(complexId && { complexId }),
        ...(category && { category }),
      },
      include: { complex: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: { complex: { select: { id: true, name: true } } },
    });
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async create(dto: CreateExpenseDto) {
    const expense = await this.prisma.expense.create({
      data: {
        description: dto.description,
        amount: dto.amount,
        date: new Date(dto.date),
        category: dto.category ?? 'OTHER',
        complexId: dto.complexId,
        receipt: dto.receipt,
        notes: dto.notes,
        maintenanceRequestId: dto.maintenanceRequestId,
      },
      include: { complex: { select: { id: true, name: true } } },
    });

    if (dto.distributeToTenants) {
      await this.distributeExpenseToTenants(expense.id, dto.complexId, Number(expense.amount), expense.description);
    } else if (dto.assignToTenantId) {
      await this.assignExpenseToTenant(expense.id, dto.assignToTenantId, Number(expense.amount), expense.description);
    }

    return expense;
  }

  private async distributeExpenseToTenants(
    expenseId: string,
    complexId: string,
    totalAmount: number,
    description: string,
  ) {
    const activeLeases = await this.prisma.lease.findMany({
      where: {
        status: 'ACTIVE',
        apartment: { complexId },
      },
      select: {
        id: true,
        tenantId: true,
        apartmentId: true,
      },
    });

    if (activeLeases.length === 0) return;

    const perTenant = Math.round((totalAmount / activeLeases.length) * 100) / 100;

    for (const lease of activeLeases) {
      await this.ledger.writeEntry({
        type: 'CHARGE',
        category: 'EXTRA',
        direction: 'DEBIT',
        amount: perTenant,
        description,
        referenceId: expenseId,
        referenceType: 'EXPENSE',
        tenantId: lease.tenantId,
        leaseId: lease.id,
        apartmentId: lease.apartmentId,
      });
    }
  }

  private async assignExpenseToTenant(
    expenseId: string,
    tenantId: string,
    amount: number,
    description: string,
  ) {
    const lease = await this.prisma.lease.findFirst({
      where: { tenantId, status: 'ACTIVE' },
      select: { id: true, apartmentId: true },
    });
    if (!lease) return;

    await this.ledger.writeEntry({
      type: 'CHARGE',
      category: 'EXTRA',
      direction: 'DEBIT',
      amount,
      description,
      referenceId: expenseId,
      referenceType: 'EXPENSE',
      tenantId,
      leaseId: lease.id,
      apartmentId: lease.apartmentId,
    });
  }

  async update(id: string, dto: UpdateExpenseDto) {
    await this.findOne(id);
    const expense = await this.prisma.expense.update({
      where: { id },
      data: {
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.date !== undefined && { date: new Date(dto.date) }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.receipt !== undefined && { receipt: dto.receipt }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.maintenanceRequestId !== undefined && { maintenanceRequestId: dto.maintenanceRequestId }),
      },
      include: { complex: { select: { id: true, name: true } } },
    });

    if (dto.distributeToTenants || dto.assignToTenantId) {
      const alreadyDistributed = await this.prisma.ledgerEntry.count({
        where: { referenceId: id, referenceType: 'EXPENSE' },
      });
      if (alreadyDistributed === 0) {
        if (dto.distributeToTenants) {
          await this.distributeExpenseToTenants(id, expense.complexId, Number(expense.amount), expense.description);
        } else if (dto.assignToTenantId) {
          await this.assignExpenseToTenant(id, dto.assignToTenantId, Number(expense.amount), expense.description);
        }
      }
    }

    return expense;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.expense.delete({ where: { id } });
  }
}
