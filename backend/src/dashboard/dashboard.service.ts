import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [
      totalComplexes,
      totalApartments,
      availableApartments,
      totalTenants,
      activeLeases,
      pendingPayments,
    ] = await Promise.all([
      this.prisma.apartmentComplex.count({ where: { isActive: true } }),
      this.prisma.apartment.count(),
      this.prisma.apartment.count({ where: { status: 'AVAILABLE' } }),
      this.prisma.tenant.count({ where: { isActive: true } }),
      this.prisma.lease.count({ where: { status: 'ACTIVE' } }),
      this.prisma.payment.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      totalComplexes,
      totalApartments,
      availableApartments,
      occupiedApartments: totalApartments - availableApartments,
      totalTenants,
      activeLeases,
      pendingPayments,
    };
  }
}
