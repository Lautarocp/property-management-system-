import { IsString, IsNotEmpty, IsNumber, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class TransferLeaseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  newApartmentId!: string;

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
}
