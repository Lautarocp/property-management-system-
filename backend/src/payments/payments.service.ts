import { Injectable, NotFoundException } from '@nestjs/common';
// @ts-ignore – pdfkit is installed in the Docker container
import PDFDocument from 'pdfkit';
import { PrismaService } from '@/prisma/prisma.service';
import { LedgerService } from '@/ledger/ledger.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentType, LedgerEntryCategory, Prisma } from '@prisma/client';

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

type PaymentWithRelations = Prisma.PaymentGetPayload<{ include: typeof PAYMENT_INCLUDE }>;
type PaymentItemRow = PaymentWithRelations['items'][number] & { ledgerCategory?: string | null };

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
          items: { create: dto.items.map((i) => ({ name: i.name, amount: i.amount })) },
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

  async markAsPaid(id: string, paidItemIds?: string[]) {
    const payment = await this.findOne(id);
    const items = payment.items as PaymentItemRow[];

    const hasItems = items.length > 0;
    const isPartial = hasItems && paidItemIds && paidItemIds.length > 0 && paidItemIds.length < items.length;

    if (isPartial) {
      const selectedItems = items.filter((i) => paidItemIds!.includes(i.id));
      const unpaidIds = items.filter((i) => !paidItemIds!.includes(i.id)).map((i) => i.id);

      // Remove unpaid items from this payment — their DEBIT stays in the ledger as outstanding
      await this.prisma.paymentItem.deleteMany({ where: { id: { in: unpaidIds } } });

      const paidAmount = selectedItems.reduce((sum, i) => sum + Number(i.amount), 0);
      await this.prisma.payment.update({ where: { id }, data: { amount: paidAmount } });

      // Create per-category CREDIT entries so each debt is properly settled in the ledger
      const creditsByCategory = new Map<string, number>();
      for (const item of selectedItems) {
        const cat: string = item.ledgerCategory ?? this.mapTypeToCategory(payment.type);
        creditsByCategory.set(cat, (creditsByCategory.get(cat) ?? 0) + Number(item.amount));
      }

      for (const [category, amount] of creditsByCategory) {
        await this.ledger.writeEntry({
          type: 'PAYMENT',
          category: category as LedgerEntryCategory,
          direction: 'CREDIT',
          amount,
          description: 'Payment received',
          referenceId: id,
          referenceType: 'Payment',
          tenantId: payment.tenantId,
          leaseId: payment.leaseId,
          apartmentId: payment.lease.apartment.id,
        });
      }

      return this.prisma.payment.update({
        where: { id },
        data: { status: 'PAID', paidDate: new Date() },
      });
    }

    // Full payment — existing behavior
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

  async generatePdf(id: string): Promise<any> {
    const payment = await this.findOne(id);
    const tenant = payment.tenant;
    const apartment = payment.lease.apartment;
    const complex = (apartment as any).complex;

    const typeLabels: Record<string, string> = {
      RENT: 'Alquiler', DEPOSIT: 'Depósito', LATE_FEE: 'Cargo por Mora',
      MAINTENANCE: 'Mantenimiento', OTHER: 'Otro',
    };
    const statusLabels: Record<string, string> = {
      PENDING: 'PENDIENTE', PAID: 'PAGADO', OVERDUE: 'VENCIDO', CANCELLED: 'CANCELADO',
    };

    const items: { name: string; amount: number }[] = payment.items?.length
      ? payment.items.map((i: any) => ({ name: i.name, amount: Number(i.amount) }))
      : [{ name: typeLabels[payment.type] ?? payment.type, amount: Number(payment.amount) }];

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: any[] = [];
      doc.on('data', (chunk: any) => chunks.push(chunk));
      // @ts-ignore – Buffer is available in Node/Docker container
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text('COMPROBANTE DE PAGO', { align: 'center' });
      doc.fontSize(12).font('Helvetica').text(complex?.name ?? '', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(8).fillColor('#888').text(`Ref: ${id}`, { align: 'right' });
      doc.fillColor('#000');
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.8);

      // Tenant & apartment info
      doc.fontSize(10).font('Helvetica-Bold').text('INQUILINO');
      doc.font('Helvetica').text(`Nombre: ${tenant.firstName} ${tenant.lastName}`);
      if (tenant.email) doc.text(`Email: ${tenant.email}`);
      doc.moveDown(0.5);

      doc.font('Helvetica-Bold').text('UNIDAD');
      doc.font('Helvetica').text(`Apartamento: #${apartment.number}${(apartment as any).floor ? ` (Piso ${(apartment as any).floor})` : ''}`);
      doc.text(`Edificio: ${complex?.name ?? '-'}`);
      doc.moveDown(0.5);

      const dueDate = new Date(payment.dueDate);
      doc.font('Helvetica-Bold').text('PERÍODO');
      doc.font('Helvetica').text(`Mes: ${dueDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}`);
      doc.text(`Vencimiento: ${dueDate.toLocaleDateString('es-AR')}`);
      if (payment.paidDate) doc.text(`Fecha de pago: ${new Date(payment.paidDate).toLocaleDateString('es-AR')}`);
      doc.moveDown(0.8);

      // Items table header
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica-Bold');
      const headerY = doc.y;
      doc.text('DESCRIPCIÓN', 50, headerY);
      doc.text('MONTO', 50, headerY, { width: 495, align: 'right' });
      doc.moveDown(0.8);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#ccc').stroke();
      doc.strokeColor('#000');
      doc.moveDown(0.5);

      // Items
      doc.font('Helvetica').fontSize(10);
      for (const item of items) {
        const rowY = doc.y;
        const amt = `$${item.amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        doc.text(item.name, 50, rowY, { width: 350 });
        doc.text(amt, 50, rowY, { width: 495, align: 'right' });
        doc.y = rowY + 18;
      }

      // Total
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.5);
      const totalY = doc.y;
      const totalAmt = `$${Number(payment.amount).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      doc.font('Helvetica-Bold').fontSize(12).text('TOTAL', 50, totalY);
      doc.text(totalAmt, 50, totalY, { width: 495, align: 'right' });
      doc.moveDown(1.2);

      // Status
      const status = statusLabels[payment.status] ?? payment.status;
      doc.fontSize(11).text(`Estado: ${status}`);
      if (payment.notes) {
        doc.moveDown(0.3);
        doc.font('Helvetica-Oblique').fontSize(9).text(`Notas: ${payment.notes}`);
      }

      // Footer
      doc.moveDown(2);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#ccc').stroke();
      doc.moveDown(0.3);
      doc.fontSize(8).fillColor('#888').font('Helvetica')
        .text(`Generado el ${new Date().toLocaleDateString('es-AR')}`, { align: 'center' });

      doc.end();
    });
  }
}
