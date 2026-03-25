import { IsString, IsNotEmpty, IsEmail, IsOptional, IsDateString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  dni?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  hasGuarantor?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  guarantorFirstName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  guarantorLastName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  guarantorDni?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  guarantorPhone?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  guarantorEmail?: string;
}
