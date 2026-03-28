import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

const PAYMENT_INCLUDE = {
  items: { orderBy: { createdAt: 'asc' as const } },
  tenant: { select: { id: true, firstName: true, lastName: true, email: true } },
  lease: {
    include: {
      apartment: {
        select: {
          id: true,
          number: true,
          floor: true,
          complex: { select: { id: true, name: true } },
        },
      },
    },
  },
};

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  private async updateOverdue() {
    await this.prisma.payment.updateMany({
      where: { status: 'PENDING', dueDate: { lt: new Date() } },
      data: { status: 'OVERDUE' },
    });
  }

  async findAll(filters?: { leaseId?: string; tenantId?: string; status?: string }) {
    await this.updateOverdue();
    return this.prisma.payment.findMany({
      where: {
        ...(filters?.leaseId && { leaseId: filters.leaseId }),
        ...(filters?.tenantId && { tenantId: filters.tenantId }),
        ...(filters?.status && { status: filters.status as any }),
      },
      include: PAYMENT_INCLUDE,
      orderBy: { dueDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: PAYMENT_INCLUDE,
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async create(dto: CreatePaymentDto) {
    const lease = await this.prisma.lease.findUnique({
      where: { id: dto.leaseId },
      select: { tenantId: true },
    });
    if (!lease) throw new NotFoundException('Lease not found');

    const amount = dto.items?.length
      ? dto.items.reduce((sum, i) => sum + i.amount, 0)
      : (dto.amount ?? 0);

    return this.prisma.payment.create({
      data: {
        leaseId: dto.leaseId,
        tenantId: lease.tenantId,
        amount,
        dueDate: new Date(dto.dueDate),
        type: dto.type ?? 'RENT',
        notes: dto.notes,
        status: 'PENDING',
        ...(dto.items?.length && {
          items: { create: dto.items.map(i => ({ name: i.name, amount: i.amount })) },
        }),
      },
      include: PAYMENT_INCLUDE,
    });
  }

  async markAsPaid(id: string) {
    await this.findOne(id);
    return this.prisma.payment.update({
      where: { id },
      data: { status: 'PAID', paidDate: new Date() },
    });
  }

  async markAsUnpaid(id: string) {
    await this.findOne(id);
    return this.prisma.payment.update({
      where: { id },
      data: { status: 'PENDING', paidDate: null },
    });
  }

  async update(id: string, dto: UpdatePaymentDto) {
    await this.findOne(id);
    return this.prisma.payment.update({
      where: { id },
      data: {
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.dueDate !== undefined && { dueDate: new Date(dto.dueDate) }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.payment.delete({ where: { id } });
  }
}
