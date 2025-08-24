import { Injectable } from '@nestjs/common';
import { Property, Building, Unit } from '../interfaces/property.interface';
import {
  GeneralInfoStepDto,
  BuildingDataStepDto,
  UnitsDataStepDto,
} from '../dto/update-step.dto';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

@Injectable()
export class ValidationService {
  /**
   * Validates complete property data
   */
  validateProperty(property: Property): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic property validation
    if (!property.name?.trim()) {
      errors.push('Property name is required');
    }

    if (!property.address?.trim()) {
      errors.push('Property address is required');
    }

    if (!property.propertyNumber?.trim()) {
      errors.push('Property number is required');
    }

    // Building validation
    if (!property.buildings || property.buildings.length === 0) {
      warnings.push('Property has no buildings defined');
    } else {
      property.buildings.forEach((building, buildingIndex) => {
        const buildingErrors = this.validateBuilding(building, property.type);
        buildingErrors.errors.forEach((error) =>
          errors.push(`Building ${buildingIndex + 1}: ${error}`),
        );
        buildingErrors.warnings.forEach((warning) =>
          warnings.push(`Building ${buildingIndex + 1}: ${warning}`),
        );
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validates a single building
   */
  validateBuilding(
    building: Building,
    propertyType: 'WEG' | 'MV',
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Address validation
    if (!building.streetName?.trim()) {
      errors.push('Street name is required');
    }

    if (!building.houseNumber?.trim()) {
      errors.push('House number is required');
    }

    if (!building.postalCode?.trim()) {
      errors.push('Postal code is required');
    } else if (!/^\d{4,10}$/.test(building.postalCode.trim())) {
      warnings.push('Postal code format may be invalid');
    }

    if (!building.city?.trim()) {
      errors.push('City is required');
    }

    // Building structure validation
    if (!building.floors || building.floors < 1) {
      errors.push('Number of floors must be at least 1');
    }

    if (!building.unitsPerFloor || building.unitsPerFloor < 1) {
      errors.push('Units per floor must be at least 1');
    }

    if (
      building.constructionYear &&
      (building.constructionYear < 1800 ||
        building.constructionYear > new Date().getFullYear() + 10)
    ) {
      warnings.push(
        `Construction year ${building.constructionYear} seems unusual`,
      );
    }

    // Units validation
    if (!building.units || building.units.length === 0) {
      warnings.push('Building has no units defined');
    } else {
      // Check unit count vs expected count
      const expectedUnits = building.floors * building.unitsPerFloor;
      if (building.units.length !== expectedUnits) {
        warnings.push(
          `Expected ${expectedUnits} units (${building.floors} floors × ${building.unitsPerFloor} units/floor) but found ${building.units.length}`,
        );
      }

      // Validate individual units
      const unitValidation = this.validateUnits(building.units, propertyType);
      errors.push(...unitValidation.errors);
      warnings.push(...unitValidation.warnings);

      // Check for unique unit numbers
      const unitNumbers = building.units
        .map((unit) => unit.unitNumber)
        .filter(Boolean);
      const uniqueUnitNumbers = new Set(unitNumbers);
      if (unitNumbers.length !== uniqueUnitNumbers.size) {
        errors.push('Unit numbers must be unique within the building');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validates units array
   */
  validateUnits(units: Unit[], propertyType: 'WEG' | 'MV'): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    units.forEach((unit, unitIndex) => {
      // Basic unit validation
      if (!unit.unitNumber?.trim()) {
        errors.push(`Unit ${unitIndex + 1}: Unit number is required`);
      }

      if (typeof unit.floor !== 'number' || unit.floor < 0) {
        errors.push(`Unit ${unitIndex + 1}: Valid floor number is required`);
      }

      if (!unit.type) {
        errors.push(`Unit ${unitIndex + 1}: Unit type is required`);
      }

      if (typeof unit.rooms !== 'number' || unit.rooms < 0) {
        errors.push(`Unit ${unitIndex + 1}: Valid number of rooms is required`);
      }

      if (typeof unit.size !== 'number' || unit.size <= 0) {
        errors.push(`Unit ${unitIndex + 1}: Valid size is required`);
      } else if (unit.size > 10000) {
        warnings.push(
          `Unit ${unitIndex + 1}: Size ${unit.size} m² is unusually large`,
        );
      }

      // Property type specific validation
      if (propertyType === 'WEG') {
        if (
          typeof unit.ownershipShare !== 'number' ||
          unit.ownershipShare <= 0
        ) {
          errors.push(
            `Unit ${unitIndex + 1}: Ownership share is required for WEG properties`,
          );
        } else if (unit.ownershipShare > 100) {
          errors.push(
            `Unit ${unitIndex + 1}: Ownership share cannot exceed 100%`,
          );
        }

        if (unit.rent !== undefined) {
          warnings.push(
            `Unit ${unitIndex + 1}: Rent value is not typically used for WEG properties`,
          );
        }
      } else if (propertyType === 'MV') {
        if (typeof unit.rent !== 'number' || unit.rent < 0) {
          errors.push(
            `Unit ${unitIndex + 1}: Valid rent is required for MV properties`,
          );
        } else if (unit.rent > 50000) {
          warnings.push(
            `Unit ${unitIndex + 1}: Rent ${unit.rent}€ is unusually high`,
          );
        }

        if (unit.ownershipShare !== undefined) {
          warnings.push(
            `Unit ${unitIndex + 1}: Ownership share is not typically used for MV properties`,
          );
        }
      }
    });

    // Validate ownership shares sum for WEG properties
    if (propertyType === 'WEG') {
      const totalShares = units.reduce((sum, unit) => {
        return (
          sum +
          (typeof unit.ownershipShare === 'number' ? unit.ownershipShare : 0)
        );
      }, 0);

      if (Math.abs(totalShares - 100) > 0.1) {
        errors.push(
          `Total ownership shares (${totalShares.toFixed(2)}%) must sum to 100% (±0.1% tolerance)`,
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validates step 1 completion (General Info)
   */
  isStep1Complete(data: GeneralInfoStepDto): boolean {
    return !!(data.name?.trim() && data.type && data.address?.trim());
  }

  /**
   * Validates step 2 completion (Building Data)
   */
  isStep2Complete(data: BuildingDataStepDto): boolean {
    if (!data.buildings || data.buildings.length === 0) return false;

    return data.buildings.every(
      (building) =>
        building.streetName?.trim() &&
        building.houseNumber?.trim() &&
        building.postalCode?.trim() &&
        building.city?.trim() &&
        building.buildingType &&
        building.floors &&
        building.floors > 0 &&
        building.unitsPerFloor &&
        building.unitsPerFloor > 0,
    );
  }

  /**
   * Validates step 3 completion (Units Data)
   */
  isStep3Complete(data: UnitsDataStepDto, propertyType: 'WEG' | 'MV'): boolean {
    if (!data.buildings || data.buildings.length === 0) return false;

    return data.buildings.every((building) => {
      if (!building.units || building.units.length === 0) return false;

      return building.units.every((unit) => {
        const basicComplete =
          unit.unitNumber?.trim() &&
          unit.type &&
          typeof unit.rooms === 'number' &&
          unit.rooms >= 0 &&
          typeof unit.size === 'number' &&
          unit.size > 0;

        if (propertyType === 'WEG') {
          return (
            basicComplete &&
            typeof unit.ownershipShare === 'number' &&
            unit.ownershipShare > 0
          );
        } else {
          return (
            basicComplete && typeof unit.rent === 'number' && unit.rent >= 0
          );
        }
      });
    });
  }

  /**
   * Calculates property completion percentage
   */
  calculateCompletionPercentage(property: Property): number {
    let completedSections = 0;
    const totalSections = 3;

    // Section 1: General Information (33%)
    if (property.name?.trim() && property.type && property.address?.trim()) {
      completedSections++;
    }

    // Section 2: Buildings (33%)
    if (property.buildings && property.buildings.length > 0) {
      const allBuildingsComplete = property.buildings.every(
        (building) =>
          building.streetName?.trim() &&
          building.houseNumber?.trim() &&
          building.postalCode?.trim() &&
          building.city?.trim() &&
          building.buildingType &&
          building.floors &&
          building.floors > 0 &&
          building.unitsPerFloor &&
          building.unitsPerFloor > 0,
      );
      if (allBuildingsComplete) {
        completedSections++;
      }
    }

    // Section 3: Units (34%)
    if (property.buildings && property.buildings.length > 0) {
      const allUnitsComplete = property.buildings.every((building) => {
        if (!building.units || building.units.length === 0) return false;

        return building.units.every((unit) => {
          const basicComplete =
            unit.unitNumber?.trim() &&
            unit.type &&
            typeof unit.rooms === 'number' &&
            unit.rooms >= 0 &&
            typeof unit.size === 'number' &&
            unit.size > 0;

          if (property.type === 'WEG') {
            return (
              basicComplete &&
              typeof unit.ownershipShare === 'number' &&
              unit.ownershipShare > 0
            );
          } else {
            return (
              basicComplete && typeof unit.rent === 'number' && unit.rent >= 0
            );
          }
        });
      });
      if (allUnitsComplete) {
        completedSections++;
      }
    }

    return Math.round((completedSections / totalSections) * 100);
  }

  /**
   * Updates property progress tracking
   */
  updateProgressTracking(property: Property): Property {
    const completionPercentage = this.calculateCompletionPercentage(property);
    const completed = completionPercentage === 100;

    return {
      ...property,
      completionPercentage,
      completed,
      lastModified: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}
