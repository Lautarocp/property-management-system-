import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { BillingService } from './billing.service';

@ApiTags('billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly service: BillingService) {}

  @Post('generate-monthly-rent')
  generateMonthlyRent(@Body() body: { month?: string }) {
    return this.service.generateMonthlyRent(body.month);
  }
}
