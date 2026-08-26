import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApartmentStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateApartmentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  number!: string;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  floor?: number;

  @ApiPropertyOptional({ enum: ApartmentStatus })
  @IsEnum(ApartmentStatus)
  @IsOptional()
  status?: ApartmentStatus;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  complexId!: string;
}
