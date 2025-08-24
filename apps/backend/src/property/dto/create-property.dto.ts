import { IsString, IsEnum, IsOptional, IsArray, ValidateNested, IsNumber, MinLength, MaxLength, Min, Max, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOwnershipShareValid, HasValidRent, HasUniqueUnitNumbers } from '../validators/ownership-share.validator';

export type PropertyType = 'WEG' | 'MV';
export type BuildingType = 'altbau' | 'neubau' | 'hochhaus' | 'mixed';
export type UnitType = 'apartment' | 'office' | 'parking' | 'storage' | 'commercial';

class UnitDto {
  @ApiProperty({ 
    description: 'Unit number (e.g., "1A", "2.3", "B12")', 
    example: '1A',
    minLength: 1,
    maxLength: 10
  })
  @IsString()
  @MinLength(1)
  @MaxLength(10)
  unitNumber!: string;

  @ApiProperty({ 
    description: 'Floor number (0 for ground floor)', 
    example: 1,
    minimum: 0,
    maximum: 100
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  floor!: number;

  @ApiProperty({ 
    description: 'Type of unit', 
    enum: ['apartment', 'office', 'parking', 'storage', 'commercial'],
    example: 'apartment'
  })
  @IsEnum(['apartment', 'office', 'parking', 'storage', 'commercial'])
  type!: UnitType;

  @ApiProperty({ 
    description: 'Number of rooms', 
    example: 3,
    minimum: 0,
    maximum: 20
  })
  @IsNumber()
  @Min(0)
  @Max(20)
  rooms!: number;

  @ApiProperty({ 
    description: 'Size in square meters', 
    example: 85.5,
    minimum: 1,
    maximum: 10000
  })
  @IsNumber()
  @Min(1)
  @Max(10000)
  size!: number;

  @ApiPropertyOptional({ 
    description: 'Ownership share percentage (for WEG properties)', 
    example: 8.33,
    minimum: 0.01,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Max(100)
  ownershipShare?: number;

  @ApiPropertyOptional({ 
    description: 'Owner name (for WEG properties)', 
    example: 'Familie Schmidt',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  owner?: string;

  @ApiPropertyOptional({ 
    description: 'Monthly rent (for MV properties)', 
    example: 1200,
    minimum: 0,
    maximum: 100000
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100000)
  rent?: number;

  @ApiPropertyOptional({ 
    description: 'Current tenant name (for MV properties)', 
    example: 'Herr Müller',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  tenant?: string;
}

class BuildingDto {
  @ApiProperty({ 
    description: 'Street name', 
    example: 'Berliner Straße',
    minLength: 1,
    maxLength: 100
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  streetName!: string;

  @ApiProperty({ 
    description: 'House number', 
    example: '42A',
    minLength: 1,
    maxLength: 20
  })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  houseNumber!: string;

  @ApiProperty({ 
    description: 'Postal code', 
    example: '10115',
    minLength: 4,
    maxLength: 10
  })
  @IsString()
  @MinLength(4)
  @MaxLength(10)
  postalCode!: string;

  @ApiProperty({ 
    description: 'City name', 
    example: 'Berlin',
    minLength: 1,
    maxLength: 100
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  city!: string;

  @ApiProperty({ 
    description: 'Building type', 
    enum: ['altbau', 'neubau', 'hochhaus', 'mixed'],
    example: 'altbau'
  })
  @IsEnum(['altbau', 'neubau', 'hochhaus', 'mixed'])
  buildingType!: BuildingType;

  @ApiProperty({ 
    description: 'Number of floors', 
    example: 4,
    minimum: 1,
    maximum: 200
  })
  @IsNumber()
  @IsPositive()
  @Max(200)
  floors!: number;

  @ApiProperty({ 
    description: 'Number of units per floor', 
    example: 3,
    minimum: 1,
    maximum: 50
  })
  @IsNumber()
  @IsPositive()
  @Max(50)
  unitsPerFloor!: number;

  @ApiPropertyOptional({ 
    description: 'Construction year', 
    example: 1905,
    minimum: 1800,
    maximum: 2030
  })
  @IsOptional()
  @IsNumber()
  @Min(1800)
  @Max(2030)
  constructionYear?: number;

  @ApiProperty({ 
    description: 'Units in this building', 
    type: [UnitDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UnitDto)
  units!: UnitDto[];
}

export class CreatePropertyDto {
  @ApiProperty({ 
    description: 'Property name', 
    example: 'Berliner Straße 42',
    minLength: 1,
    maxLength: 200
  })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @ApiProperty({ 
    description: 'Property type', 
    enum: ['WEG', 'MV'],
    example: 'WEG',
    enumName: 'PropertyType'
  })
  @IsEnum(['WEG', 'MV'])
  type!: PropertyType;

  @ApiProperty({ 
    description: 'Unique property number', 
    example: 'WEG-2025-001',
    minLength: 1,
    maxLength: 50
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  propertyNumber!: string;

  @ApiPropertyOptional({ 
    description: 'Management company name', 
    example: 'Hausverwaltung Schmidt & Partners',
    maxLength: 200
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  managementCompany?: string;

  @ApiPropertyOptional({ 
    description: 'Property manager name', 
    example: 'Thomas Schmidt',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  propertyManager?: string;

  @ApiPropertyOptional({ 
    description: 'Accountant name', 
    example: 'Lisa Becker',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  accountant?: string;

  @ApiProperty({ 
    description: 'Property address', 
    example: 'Berliner Straße 42, 10115 Berlin',
    minLength: 5,
    maxLength: 500
  })
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  address!: string;

  @ApiProperty({ 
    description: 'Buildings that make up this property', 
    type: [BuildingDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BuildingDto)
  @IsOwnershipShareValid()
  @HasValidRent()
  @HasUniqueUnitNumbers()
  buildings!: BuildingDto[];
}