import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('revenue/by-month')
  getRevenueByMonth(@Query('complexId') complexId?: string) {
    return this.service.getRevenueByMonth(complexId);
  }

  @Get('revenue/by-complex')
  getRevenueByComplex() {
    return this.service.getRevenueByComplex();
  }

  @Get('outstanding-balances')
  getOutstandingBalances() {
    return this.service.getOutstandingBalances();
  }

  @Get('maintenance-costs')
  getMaintenanceCostTotals(
    @Query('complexId') complexId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.getMaintenanceCostTotals(complexId, from, to);
  }

  @Get('expenses/by-category')
  getExpenseTotalsByCategory(@Query('complexId') complexId?: string) {
    return this.service.getExpenseTotalsByCategory(complexId);
  }
}
