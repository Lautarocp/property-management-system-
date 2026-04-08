import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { LedgerService } from '@/ledger/ledger.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { MaintenanceStatus } from '@prisma/client';

const include = {
  apartment: { include: { complex: true } },
  tenant: true,
};

@Injectable()
export class MaintenanceService {
  constructor(
    private prisma: PrismaService,
    private ledger: LedgerService,
  ) {}

  async findAll(apartmentId?: string, status?: MaintenanceStatus) {
    return this.prisma.maintenanceRequest.findMany({
      where: {
        ...(apartmentId ? { apartmentId } : {}),
        ...(status ? { status } : {}),
      },
      include,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.maintenanceRequest.findUnique({ where: { id }, include });
    if (!record) throw new NotFoundException('Maintenance request not found');
    return record;
  }

  async create(dto: CreateMaintenanceDto) {
    const activeLease = await this.prisma.lease.findFirst({
      where: { apartmentId: dto.apartmentId, status: 'ACTIVE' },
    });

    // Compute tenantChargeAmount from percentage if provided
    let tenantChargeAmount = dto.tenantChargeAmount;
    if (dto.tenantPercentage !== undefined && dto.repairCost !== undefined) {
      tenantChargeAmount = (dto.repairCost * dto.tenantPercentage) / 100;
    }

    const maintenance = await this.prisma.maintenanceRequest.create({
      data: {
        title: dto.title,
        description: dto.description,
        apartmentId: dto.apartmentId,
        priority: dto.priority,
        repairCost: dto.repairCost,
        tenantChargeAmount,
        tenantPercentage: dto.tenantPercentage,
        ownerPercentage: dto.ownerPercentage,
        notes: dto.notes,
        tenantId: activeLease?.tenantId ?? null,
      },
      include,
    });

    if (tenantChargeAmount && tenantChargeAmount > 0 && activeLease) {
      await this.prisma.payment.create({
        data: {
          amount: tenantChargeAmount,
          dueDate: new Date(),
          status: 'PENDING',
          type: 'MAINTENANCE',
          notes: `Maintenance charge: ${dto.title}`,
          leaseId: activeLease.id,
          tenantId: activeLease.tenantId,
          maintenanceRequestId: maintenance.id,
        },
      });

      await this.ledger.writeEntry({
        type: 'CHARGE',
        category: 'MAINTENANCE',
        direction: 'DEBIT',
        amount: tenantChargeAmount,
        description: `Maintenance charge: ${dto.title}`,
        referenceId: maintenance.id,
        referenceType: 'MaintenanceRequest',
        tenantId: activeLease.tenantId,
        leaseId: activeLease.id,
        apartmentId: dto.apartmentId,
      });
    }

    return this.findOne(maintenance.id);
  }

  async update(id: string, dto: UpdateMaintenanceDto) {
    const existing = await this.findOne(id);
    const data: any = { ...dto };

    // Compute tenantChargeAmount from percentage if provided
    if (dto.tenantPercentage !== undefined && dto.repairCost !== undefined) {
      data.tenantChargeAmount = (dto.repairCost * dto.tenantPercentage) / 100;
    } else if (dto.tenantPercentage !== undefined && existing.repairCost) {
      data.tenantChargeAmount = (Number(existing.repairCost) * dto.tenantPercentage) / 100;
    }

    if (dto.status === 'RESOLVED' || dto.status === 'CLOSED') {
      data.resolvedAt = new Date();
    } else if (dto.status === 'OPEN' || dto.status === 'IN_PROGRESS') {
      data.resolvedAt = null;
    }

    const updated = await this.prisma.maintenanceRequest.update({ where: { id }, data, include });

    const newChargeAmount = data.tenantChargeAmount ?? dto.tenantChargeAmount;

    if (newChargeAmount !== undefined) {
      const linkedPayment = await this.prisma.payment.findFirst({
        where: { maintenanceRequestId: id, status: { not: 'PAID' } },
      });

      const previousAmount = Number(existing.tenantChargeAmount ?? 0);
      const newAmount = Number(newChargeAmount);

      if (newAmount > 0) {
        if (linkedPayment) {
          await this.prisma.payment.update({
            where: { id: linkedPayment.id },
            data: { amount: newAmount },
          });
        } else {
          const activeLease = await this.prisma.lease.findFirst({
            where: { apartmentId: existing.apartmentId, status: 'ACTIVE' },
          });
          if (activeLease) {
            await this.prisma.payment.create({
              data: {
                amount: newAmount,
                dueDate: new Date(),
                status: 'PENDING',
                type: 'MAINTENANCE',
                notes: `Maintenance charge: ${updated.title}`,
                leaseId: activeLease.id,
                tenantId: activeLease.tenantId,
                maintenanceRequestId: id,
              },
            });
          }
        }

        // Write adjustment ledger entry for delta
        const delta = newAmount - previousAmount;
        if (delta > 0 && existing.tenantId) {
          const leaseForAdjustment = linkedPayment
            ? await this.prisma.lease.findFirst({ where: { id: linkedPayment.leaseId } })
            : await this.prisma.lease.findFirst({ where: { apartmentId: existing.apartmentId, status: 'ACTIVE' } });

          if (leaseForAdjustment) {
            await this.ledger.writeEntry({
              type: 'CHARGE',
              category: 'ADJUSTMENT',
              direction: 'DEBIT',
              amount: delta,
              description: `Maintenance charge adjustment: ${updated.title}`,
              referenceId: id,
              referenceType: 'MaintenanceRequest',
              tenantId: existing.tenantId,
              leaseId: leaseForAdjustment.id,
              apartmentId: existing.apartmentId,
            });
          }
        } else if (delta < 0 && existing.tenantId) {
          // Charge decreased — write credit adjustment
          const activeLease = await this.prisma.lease.findFirst({ where: { apartmentId: existing.apartmentId, status: 'ACTIVE' } });
          if (activeLease) {
            await this.ledger.writeEntry({
              type: 'CHARGE',
              category: 'ADJUSTMENT',
              direction: 'CREDIT',
              amount: Math.abs(delta),
              description: `Maintenance charge reduction: ${updated.title}`,
              referenceId: id,
              referenceType: 'MaintenanceRequest',
              tenantId: existing.tenantId,
              leaseId: activeLease.id,
              apartmentId: existing.apartmentId,
            });
          }
        }
      } else if (linkedPayment) {
        await this.prisma.payment.update({
          where: { id: linkedPayment.id },
          data: { status: 'CANCELLED' },
        });

        // Reverse the original charge
        if (previousAmount > 0 && existing.tenantId) {
          const activeLease = await this.prisma.lease.findFirst({ where: { apartmentId: existing.apartmentId } });
          if (activeLease) {
            await this.ledger.writeEntry({
              type: 'CHARGE',
              category: 'ADJUSTMENT',
              direction: 'CREDIT',
              amount: previousAmount,
              description: `Maintenance charge cancelled: ${updated.title}`,
              referenceId: id,
              referenceType: 'MaintenanceRequest',
              tenantId: existing.tenantId,
              leaseId: activeLease.id,
              apartmentId: existing.apartmentId,
            });
          }
        }
      }
    }

    return updated;
  }

  async remove(id: string) {
    const existing = await this.findOne(id);

    await this.prisma.payment.updateMany({
      where: { maintenanceRequestId: id, status: 'PENDING' },
      data: { status: 'CANCELLED' },
    });

    // Reverse original ledger charge if it was set
    if (existing.tenantChargeAmount && Number(existing.tenantChargeAmount) > 0 && existing.tenantId) {
      const activeLease = await this.prisma.lease.findFirst({ where: { apartmentId: existing.apartmentId } });
      if (activeLease) {
        await this.ledger.writeEntry({
          type: 'CHARGE',
          category: 'ADJUSTMENT',
          direction: 'CREDIT',
          amount: Number(existing.tenantChargeAmount),
          description: `Maintenance charge voided: ${existing.title}`,
          referenceId: id,
          referenceType: 'MaintenanceRequest',
          tenantId: existing.tenantId,
          leaseId: activeLease.id,
          apartmentId: existing.apartmentId,
        });
      }
    }

    return this.prisma.maintenanceRequest.delete({ where: { id } });
  }
}
