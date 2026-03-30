import { IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class IncreaseRentDto {
  @ApiProperty({ description: 'Percentage to increase rent (e.g. 10 = 10%)' })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  @Max(1000)
  percentage!: number;
}
