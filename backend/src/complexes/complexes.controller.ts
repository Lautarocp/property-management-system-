import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ComplexesService } from './complexes.service';

@ApiTags('complexes')
@Controller('complexes')
export class ComplexesController {
  constructor(private readonly service: ComplexesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
