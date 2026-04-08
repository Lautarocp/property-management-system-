import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ExpenseCategory } from '@prisma/client';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

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
    return this.prisma.expense.create({
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
  }

  async update(id: string, dto: UpdateExpenseDto) {
    await this.findOne(id);
    return this.prisma.expense.update({
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
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.expense.delete({ where: { id } });
  }
}
