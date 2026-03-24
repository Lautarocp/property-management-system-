import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApartmentStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateApartmentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  number!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  floor!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  bedrooms!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  bathrooms!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  area!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  monthlyRent!: number;

  @ApiPropertyOptional({ enum: ApartmentStatus })
  @IsEnum(ApartmentStatus)
  @IsOptional()
  status?: ApartmentStatus;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  complexId!: string;
}
