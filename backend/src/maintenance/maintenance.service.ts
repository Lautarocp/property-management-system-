import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { MaintenanceStatus } from '@prisma/client';

const include = {
  apartment: { include: { complex: true } },
  tenant: true,
};

@Injectable()
export class MaintenanceService {
  constructor(private prisma: PrismaService) {}

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

    const maintenance = await this.prisma.maintenanceRequest.create({
      data: {
        title: dto.title,
        description: dto.description,
        apartmentId: dto.apartmentId,
        priority: dto.priority,
        repairCost: dto.repairCost,
        tenantChargeAmount: dto.tenantChargeAmount,
        notes: dto.notes,
        tenantId: activeLease?.tenantId ?? null,
      },
      include,
    });

    if (dto.tenantChargeAmount && dto.tenantChargeAmount > 0 && activeLease) {
      await this.prisma.payment.create({
        data: {
          amount: dto.tenantChargeAmount,
          dueDate: new Date(),
          status: 'PENDING',
          type: 'MAINTENANCE',
          notes: `Maintenance charge: ${dto.title}`,
          leaseId: activeLease.id,
          tenantId: activeLease.tenantId,
          maintenanceRequestId: maintenance.id,
        },
      });
    }

    return this.findOne(maintenance.id);
  }

  async update(id: string, dto: UpdateMaintenanceDto) {
    const existing = await this.findOne(id);
    const data: any = { ...dto };
    if (dto.status === 'RESOLVED' || dto.status === 'CLOSED') {
      data.resolvedAt = new Date();
    } else if (dto.status === 'OPEN' || dto.status === 'IN_PROGRESS') {
      data.resolvedAt = null;
    }

    const updated = await this.prisma.maintenanceRequest.update({ where: { id }, data, include });

    if (dto.tenantChargeAmount !== undefined) {
      const linkedPayment = await this.prisma.payment.findFirst({
        where: { maintenanceRequestId: id, status: { not: 'PAID' } },
      });

      if (dto.tenantChargeAmount > 0) {
        if (linkedPayment) {
          await this.prisma.payment.update({
            where: { id: linkedPayment.id },
            data: { amount: dto.tenantChargeAmount },
          });
        } else {
          const activeLease = await this.prisma.lease.findFirst({
            where: { apartmentId: existing.apartmentId, status: 'ACTIVE' },
          });
          if (activeLease) {
            await this.prisma.payment.create({
              data: {
                amount: dto.tenantChargeAmount,
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
      } else if (linkedPayment) {
        await this.prisma.payment.update({
          where: { id: linkedPayment.id },
          data: { status: 'CANCELLED' },
        });
      }
    }

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.payment.updateMany({
      where: { maintenanceRequestId: id, status: 'PENDING' },
      data: { status: 'CANCELLED' },
    });
    return this.prisma.maintenanceRequest.delete({ where: { id } });
  }
}
