import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LeasesService } from './leases.service';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { TransferLeaseDto } from './dto/transfer-lease.dto';
import { CreateLeaseItemDto } from './dto/create-lease-item.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('leases')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leases')
export class LeasesController {
  constructor(private readonly service: LeasesService) {}

  @Get()
  @ApiQuery({ name: 'apartmentId', required: false })
  findAll(@Query('apartmentId') apartmentId?: string) {
    return this.service.findAll(apartmentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateLeaseDto) {
    return this.service.create(dto);
  }

  @Get(':id/pending-charges')
  getPendingCharges(@Param('id') id: string) {
    return this.service.getPendingCharges(id);
  }

  @Patch(':id/terminate')
  terminate(@Param('id') id: string, @Body() body: { deductFromDeposit?: boolean }) {
    return this.service.terminate(id, body?.deductFromDeposit ?? false);
  }

  @Patch(':id/transfer')
  transfer(@Param('id') id: string, @Body() dto: TransferLeaseDto) {
    return this.service.transfer(id, dto);
  }

  @Post(':id/items')
  addItem(@Param('id') id: string, @Body() dto: CreateLeaseItemDto) {
    return this.service.addItem(id, dto);
  }

  @Patch(':id/items/:itemId')
  updateItem(@Param('id') id: string, @Param('itemId') itemId: string, @Body() dto: CreateLeaseItemDto) {
    return this.service.updateItem(id, itemId, dto);
  }

  @Delete(':id/items/:itemId')
  removeItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.service.removeItem(id, itemId);
  }
}
