import { IsString, IsNotEmpty, IsNumber, IsDateString, IsOptional, IsEnum, ValidateNested, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreatePaymentItemDto } from './create-payment-item.dto';
import { PaymentMethod } from '@prisma/client';

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

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  amount?: number;

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

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  feeAmount?: number;

  @ApiPropertyOptional({ type: [CreatePaymentItemDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreatePaymentItemDto)
  items?: CreatePaymentItemDto[];
}
