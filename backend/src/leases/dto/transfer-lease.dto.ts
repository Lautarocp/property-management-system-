import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

export class TransferLeaseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  newApartmentId!: string;

  @ApiProperty()
  @IsDateString()
  startDate!: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  monthlyRent!: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  depositAmount?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  buildingFeeAmount?: number;
}
