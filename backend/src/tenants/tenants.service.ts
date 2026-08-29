import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  private titleCase(value: string): string {
    if (!value) return value;
    return value
      .trim()
      .toLowerCase()
      .split(/(\s+)/)
      .map((part) => (/\s+/.test(part) ? part : part.charAt(0).toUpperCase() + part.slice(1)))
      .join('');
  }

  findAll() {
    return this.prisma.tenant.findMany({
      where: { isActive: true },
      include: {
        leases: {
          where: { status: 'ACTIVE' },
          take: 1,
          include: {
            apartment: { select: { id: true, number: true, floor: true, complex: { select: { name: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        leases: {
          include: {
            apartment: { include: { complex: { select: { id: true, name: true, address: true } } } },
            items: { orderBy: { createdAt: 'asc' } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async create(dto: CreateTenantDto, userId: string) {
    try {
      return await this.prisma.tenant.create({
        data: {
          ...dto,
          firstName: this.titleCase(dto.firstName),
          lastName: this.titleCase(dto.lastName),
          guarantorFirstName: dto.guarantorFirstName ? this.titleCase(dto.guarantorFirstName) : dto.guarantorFirstName,
          guarantorLastName: dto.guarantorLastName ? this.titleCase(dto.guarantorLastName) : dto.guarantorLastName,
          birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
          createdById: userId,
        },
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('A tenant with this email already exists');
      }
      throw e;
    }
  }

  async update(id: string, dto: UpdateTenantDto) {
    await this.findOne(id);
    return this.prisma.tenant.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.firstName !== undefined && { firstName: this.titleCase(dto.firstName) }),
        ...(dto.lastName !== undefined && { lastName: this.titleCase(dto.lastName) }),
        ...(dto.guarantorFirstName !== undefined && { guarantorFirstName: dto.guarantorFirstName ? this.titleCase(dto.guarantorFirstName) : dto.guarantorFirstName }),
        ...(dto.guarantorLastName !== undefined && { guarantorLastName: dto.guarantorLastName ? this.titleCase(dto.guarantorLastName) : dto.guarantorLastName }),
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.tenant.update({ where: { id }, data: { isActive: false } });
  }
}
