import { Controller, Get, Post, Patch, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LeasesService } from './leases.service';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { TransferLeaseDto } from './dto/transfer-lease.dto';
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

  @Patch(':id/terminate')
  terminate(@Param('id') id: string) {
    return this.service.terminate(id);
  }

  @Patch(':id/transfer')
  transfer(@Param('id') id: string, @Body() dto: TransferLeaseDto) {
    return this.service.transfer(id, dto);
  }
}
