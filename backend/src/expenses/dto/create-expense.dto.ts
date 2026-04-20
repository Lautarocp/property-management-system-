import { IsString, IsNotEmpty, IsNumber, IsDateString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ExpenseCategory } from '@prisma/client';

export class CreateExpenseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  amount!: number;

  @ApiProperty()
  @IsDateString()
  date!: string;

  @ApiPropertyOptional({ enum: ExpenseCategory })
  @IsEnum(ExpenseCategory)
  @IsOptional()
  category?: ExpenseCategory;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  complexId!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  receipt?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  maintenanceRequestId?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  distributeToTenants?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  assignToTenantId?: string;
}
