import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { UpdateApartmentDto } from './dto/update-apartment.dto';

@Injectable()
export class ApartmentsService {
  constructor(private prisma: PrismaService) {}

  findAll(complexId?: string) {
    return this.prisma.apartment.findMany({
      where: complexId ? { complexId } : undefined,
      include: {
        complex: { select: { id: true, name: true } },
        leases: {
          where: { status: 'ACTIVE' },
          take: 1,
          include: {
            tenant: { select: { id: true, firstName: true, lastName: true, email: true } },
            items: { orderBy: { createdAt: 'asc' } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const apartment = await this.prisma.apartment.findUnique({
      where: { id },
      include: {
        complex: true,
        leases: {
          where: { status: 'ACTIVE' },
          take: 1,
          include: { tenant: true },
        },
      },
    });
    if (!apartment) throw new NotFoundException('Apartment not found');
    return apartment;
  }

  create(dto: CreateApartmentDto) {
    return this.prisma.apartment.create({ data: dto });
  }

  async update(id: string, dto: UpdateApartmentDto) {
    await this.findOne(id);
    return this.prisma.apartment.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    const leases = await this.prisma.lease.findMany({ where: { apartmentId: id }, select: { id: true } });
    const leaseIds = leases.map((l: { id: string }) => l.id);
    await this.prisma.payment.deleteMany({ where: { leaseId: { in: leaseIds } } });
    await this.prisma.lease.deleteMany({ where: { apartmentId: id } });
    await this.prisma.maintenanceRequest.deleteMany({ where: { apartmentId: id } });
    await this.prisma.apartment.delete({ where: { id } });
  }
}
