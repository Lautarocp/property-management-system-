import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateComplexDto } from './dto/create-complex.dto';
import { UpdateComplexDto } from './dto/update-complex.dto';

@Injectable()
export class ComplexesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.apartmentComplex.findMany({
      where: { isActive: true },
      include: { _count: { select: { apartments: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const complex = await this.prisma.apartmentComplex.findUnique({
      where: { id },
      include: { apartments: true, _count: { select: { apartments: true } } },
    });
    if (!complex) throw new NotFoundException('Complex not found');
    return complex;
  }

  create(dto: CreateComplexDto, userId: string) {
    return this.prisma.apartmentComplex.create({
      data: { ...dto, ownerId: userId },
    });
  }

  async update(id: string, dto: UpdateComplexDto) {
    await this.findOne(id);
    return this.prisma.apartmentComplex.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.apartmentComplex.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
