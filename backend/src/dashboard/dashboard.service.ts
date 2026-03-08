import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  // Placeholder implementation
  async findAll() {
    return [];
  }

  async findOne(id: string) {
    return null;
  }
}
