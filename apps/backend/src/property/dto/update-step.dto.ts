import {
  IsOptional,
  IsString,
  IsEnum,
  ValidateNested,
  IsNumber,
  IsArray,
  IsBoolean,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOwnershipShareValid,
  HasValidRent,
  HasUniqueUnitNumbers,
} from '../validators/ownership-share.validator';

export type PropertyType = 'WEG' | 'MV';
export type BuildingType = 'altbau' | 'neubau' | 'hochhaus' | 'mixed';
export type UnitType =
  | 'apartment'
  | 'office'
  | 'parking'
  | 'storage'
  | 'commercial';

// Step 1: General Information
export class GeneralInfoStepDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(['WEG', 'MV'])
  type?: PropertyType;

  @IsOptional()
  @IsString()
  propertyNumber?: string;

  @IsOptional()
  @IsString()
  managementCompany?: string;

  @IsOptional()
  @IsString()
  propertyManager?: string;

  @IsOptional()
  @IsString()
  accountant?: string;

  @IsOptional()
  @IsString()
  address?: string;
}

// Building data for Step 2
export class PartialBuildingDto {
  @IsOptional()
  @IsString()
  streetName?: string;

  @IsOptional()
  @IsString()
  houseNumber?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(['altbau', 'neubau', 'hochhaus', 'mixed'])
  buildingType?: BuildingType;

  @IsOptional()
  @IsNumber()
  floors?: number;

  @IsOptional()
  @IsNumber()
  unitsPerFloor?: number;

  @IsOptional()
  @IsNumber()
  constructionYear?: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PartialUnitDto)
  @IsArray()
  units?: PartialUnitDto[];
}

// Step 2: Building Data
export class BuildingDataStepDto {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PartialBuildingDto)
  @IsArray()
  buildings?: PartialBuildingDto[];
}

// Unit data for Step 3
export class PartialUnitDto {
  @IsOptional()
  @IsString()
  unitNumber?: string;

  @IsOptional()
  @IsNumber()
  floor?: number;

  @IsOptional()
  @IsEnum(['apartment', 'office', 'parking', 'storage', 'commercial'])
  type?: UnitType;

  @IsOptional()
  @IsNumber()
  rooms?: number;

  @IsOptional()
  @IsNumber()
  size?: number;

  // WEG specific fields
  @IsOptional()
  @IsNumber()
  ownershipShare?: number;

  @IsOptional()
  @IsString()
  owner?: string;

  // MV specific fields
  @IsOptional()
  @IsNumber()
  rent?: number;

  @IsOptional()
  @IsString()
  tenant?: string;
}

// Step 3: Units Data
export class UnitsDataStepDto {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PartialBuildingDto)
  @IsArray()
  buildings?: PartialBuildingDto[];
}

// Complete autosave DTO that can contain any combination of steps
export class AutosavePropertyDto {
  // Step 1 fields
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(['WEG', 'MV'])
  type?: PropertyType;

  @IsOptional()
  @IsString()
  propertyNumber?: string;

  @IsOptional()
  @IsString()
  managementCompany?: string;

  @IsOptional()
  @IsString()
  propertyManager?: string;

  @IsOptional()
  @IsString()
  accountant?: string;

  @IsOptional()
  @IsString()
  address?: string;

  // Step 2 & 3 fields
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PartialBuildingDto)
  @IsArray()
  buildings?: PartialBuildingDto[];

  // Step completion tracking
  @IsOptional()
  @IsBoolean()
  step1Complete?: boolean;

  @IsOptional()
  @IsBoolean()
  step2Complete?: boolean;

  @IsOptional()
  @IsBoolean()
  step3Complete?: boolean;

  // Current step being worked on
  @IsOptional()
  @IsNumber()
  currentStep?: number;
}
