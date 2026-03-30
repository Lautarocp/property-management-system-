import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ApartmentsService } from './apartments.service';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { UpdateApartmentDto } from './dto/update-apartment.dto';
import { IncreaseRentDto } from './dto/increase-rent.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('apartments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('apartments')
export class ApartmentsController {
  constructor(private readonly service: ApartmentsService) {}

  @Get()
  @ApiQuery({ name: 'complexId', required: false })
  findAll(@Query('complexId') complexId?: string) {
    return this.service.findAll(complexId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateApartmentDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateApartmentDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/increase-rent')
  increaseRent(@Param('id') id: string, @Body() dto: IncreaseRentDto) {
    return this.service.increaseRent(id, dto.percentage);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
