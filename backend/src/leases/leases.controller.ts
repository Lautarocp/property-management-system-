import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LeasesService } from './leases.service';

@ApiTags('leases')
@Controller('leases')
export class LeasesController {
  constructor(private readonly service: LeasesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
