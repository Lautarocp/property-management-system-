import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { TransferLeaseDto } from './dto/transfer-lease.dto';

@Injectable()
export class LeasesService {
  constructor(private prisma: PrismaService) {}

  findAll(apartmentId?: string) {
    return this.prisma.lease.findMany({
      where: apartmentId ? { apartmentId } : undefined,
      include: {
        tenant: { select: { id: true, firstName: true, lastName: true, email: true } },
        apartment: { select: { id: true, number: true, floor: true, complex: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const lease = await this.prisma.lease.findUnique({
      where: { id },
      include: { tenant: true, apartment: true },
    });
    if (!lease) throw new NotFoundException('Lease not found');
    return lease;
  }

  async create(dto: CreateLeaseDto) {
    const existing = await this.prisma.lease.findFirst({
      where: { apartmentId: dto.apartmentId, status: 'ACTIVE' },
    });
    if (existing) throw new BadRequestException('Apartment already has an active lease');

    const [lease] = await this.prisma.$transaction([
      this.prisma.lease.create({
        data: {
          apartmentId: dto.apartmentId,
          tenantId: dto.tenantId,
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          monthlyRent: dto.monthlyRent,
          depositAmount: dto.depositAmount,
          notes: dto.notes,
          status: 'ACTIVE',
        },
        include: {
          tenant: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
      this.prisma.apartment.update({
        where: { id: dto.apartmentId },
        data: { status: 'OCCUPIED' },
      }),
    ]);

    return lease;
  }

  async terminate(id: string) {
    const lease = await this.findOne(id);
    const [updated] = await this.prisma.$transaction([
      this.prisma.lease.update({ where: { id }, data: { status: 'TERMINATED' } }),
      this.prisma.apartment.update({
        where: { id: lease.apartmentId },
        data: { status: 'AVAILABLE' },
      }),
    ]);
    return updated;
  }

  async transfer(id: string, dto: TransferLeaseDto) {
    const currentLease = await this.findOne(id);
    if (currentLease.status !== 'ACTIVE') {
      throw new BadRequestException('Only active leases can be transferred');
    }

    const targetApartment = await this.prisma.apartment.findUnique({
      where: { id: dto.newApartmentId },
    });
    if (!targetApartment) throw new NotFoundException('Target apartment not found');
    if (targetApartment.status !== 'AVAILABLE') {
      throw new BadRequestException('Target apartment is not available');
    }

    const existingLease = await this.prisma.lease.findFirst({
      where: { apartmentId: dto.newApartmentId, status: 'ACTIVE' },
    });
    if (existingLease) throw new BadRequestException('Target apartment already has an active lease');

    const [newLease] = await this.prisma.$transaction([
      // Create new lease on target apartment
      this.prisma.lease.create({
        data: {
          apartmentId: dto.newApartmentId,
          tenantId: currentLease.tenantId,
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          monthlyRent: dto.monthlyRent,
          depositAmount: dto.depositAmount,
          status: 'ACTIVE',
        },
        include: {
          tenant: { select: { id: true, firstName: true, lastName: true, email: true } },
          apartment: { select: { id: true, number: true, floor: true } },
        },
      }),
      // Mark target apartment as occupied
      this.prisma.apartment.update({
        where: { id: dto.newApartmentId },
        data: { status: 'OCCUPIED' },
      }),
      // Terminate old lease
      this.prisma.lease.update({ where: { id }, data: { status: 'TERMINATED' } }),
      // Free old apartment
      this.prisma.apartment.update({
        where: { id: currentLease.apartmentId },
        data: { status: 'AVAILABLE' },
      }),
    ]);

    return newLease;
  }
}
