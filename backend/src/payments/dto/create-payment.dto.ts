import { IsString, IsNotEmpty, IsNumber, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum PaymentTypeEnum {
  RENT = 'RENT',
  DEPOSIT = 'DEPOSIT',
  LATE_FEE = 'LATE_FEE',
  OTHER = 'OTHER',
}

export class CreatePaymentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  leaseId!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  amount!: number;

  @ApiProperty()
  @IsDateString()
  dueDate!: string;

  @ApiPropertyOptional({ enum: PaymentTypeEnum })
  @IsEnum(PaymentTypeEnum)
  @IsOptional()
  type?: PaymentTypeEnum;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
