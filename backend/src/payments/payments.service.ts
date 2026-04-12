import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { LedgerService } from '@/ledger/ledger.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentType, LedgerEntryCategory } from '@prisma/client';

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
  constructor(
    private prisma: PrismaService,
    private ledger: LedgerService,
  ) {}

  private mapTypeToCategory(type: PaymentType): LedgerEntryCategory {
    const map: Record<PaymentType, LedgerEntryCategory> = {
      RENT: 'RENT',
      DEPOSIT: 'DEPOSIT',
      MAINTENANCE: 'MAINTENANCE',
      BUILDING_FEE: 'BUILDING_FEE',
      LATE_FEE: 'EXTRA',
      OTHER: 'EXTRA',
    };
    return map[type] ?? 'EXTRA';
  }

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
      select: { tenantId: true, apartmentId: true },
    });
    if (!lease) throw new NotFoundException('Lease not found');

    const amount = dto.items?.length
      ? dto.items.reduce((sum, i) => sum + i.amount, 0)
      : (dto.amount ?? 0);

    const payment = await this.prisma.payment.create({
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

    // Only write a DEBIT for ad-hoc charge types (LATE_FEE, OTHER).
    // RENT charges come from billing (generateMonthlyRent), DEPOSIT from leases service,
    // MAINTENANCE from maintenance service — writing a DEBIT here would double-count them.
    const adHocTypes: PaymentType[] = ['LATE_FEE', 'OTHER'];
    if (amount > 0 && adHocTypes.includes(payment.type)) {
      await this.ledger.writeEntry({
        type: 'CHARGE',
        category: this.mapTypeToCategory(payment.type),
        direction: 'DEBIT',
        amount,
        description: dto.notes ?? `${payment.type} charge`,
        referenceId: payment.id,
        referenceType: 'Payment',
        tenantId: payment.tenantId,
        leaseId: dto.leaseId,
        apartmentId: lease.apartmentId,
      });
    }

    return payment;
  }

  async markAsPaid(id: string) {
    const payment = await this.findOne(id);
    const updated = await this.prisma.payment.update({
      where: { id },
      data: { status: 'PAID', paidDate: new Date() },
    });

    if (Number(payment.amount) > 0) {
      await this.ledger.writeEntry({
        type: 'PAYMENT',
        category: this.mapTypeToCategory(payment.type),
        direction: 'CREDIT',
        amount: Number(payment.amount),
        description: 'Payment received',
        referenceId: id,
        referenceType: 'Payment',
        tenantId: payment.tenantId,
        leaseId: payment.leaseId,
        apartmentId: payment.lease.apartment.id,
      });
    }

    return updated;
  }

  async markAsUnpaid(id: string) {
    const payment = await this.findOne(id);
    const updated = await this.prisma.payment.update({
      where: { id },
      data: { status: 'PENDING', paidDate: null },
    });

    if (Number(payment.amount) > 0) {
      await this.ledger.writeEntry({
        type: 'PAYMENT',
        category: this.mapTypeToCategory(payment.type),
        direction: 'DEBIT',
        amount: Number(payment.amount),
        description: 'Payment reversal',
        referenceId: id,
        referenceType: 'PaymentReversal',
        tenantId: payment.tenantId,
        leaseId: payment.leaseId,
        apartmentId: payment.lease.apartment.id,
      });
    }

    return updated;
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
