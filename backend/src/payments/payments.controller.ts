import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Get()
  findAll(
    @Query('leaseId') leaseId?: string,
    @Query('tenantId') tenantId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAll({ leaseId, tenantId, status });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePaymentDto) {
    return this.service.create(dto);
  }

  @Patch(':id/pay')
  markAsPaid(@Param('id') id: string) {
    return this.service.markAsPaid(id);
  }

  @Patch(':id/unpay')
  markAsUnpaid(@Param('id') id: string) {
    return this.service.markAsUnpaid(id);
  }
}
