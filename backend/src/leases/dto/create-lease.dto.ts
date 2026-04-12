import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateLeaseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  apartmentId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @ApiProperty()
  @IsDateString()
  startDate!: string;

  @ApiProperty()
  @IsDateString()
  endDate!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  monthlyRent!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  depositAmount!: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  buildingFeeAmount?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
