import { OnboardingPropertyData, OnboardingBuildingData, OnboardingUnitData } from '@/types/property';

export interface FieldError {
  field: string;
  message: string;
}

export interface StepValidation {
  isValid: boolean;
  errors: FieldError[];
  completedFields: number;
  totalFields: number;
}

export class PropertyValidationService {
  
  /**
   * Validates Step 1: General Property Information
   */
  static validatePropertyStep(data: OnboardingPropertyData): StepValidation {
    const errors: FieldError[] = [];
    let completedFields = 0;
    const totalFields = 5; // name, type, propertyNumber, address, accountant (managementCompany, propertyManager are optional)

    // Property Name
    if (!data.name?.trim()) {
      errors.push({ field: 'name', message: 'Property name is required' });
    } else {
      completedFields++;
    }

    // Property Type
    if (!data.type) {
      errors.push({ field: 'type', message: 'Property type is required' });
    } else if (!['WEG', 'MV'].includes(data.type)) {
      errors.push({ field: 'type', message: 'Property type must be WEG or MV' });
    } else {
      completedFields++;
    }

    // Property Number
    if (!data.propertyNumber?.trim()) {
      errors.push({ field: 'propertyNumber', message: 'Property number is required' });
    } else {
      completedFields++;
    }

    // Address
    if (!data.address?.trim()) {
      errors.push({ field: 'address', message: 'Address is required' });
    } else {
      completedFields++;
    }

    // Accountant (required)
    if (!data.accountant?.trim()) {
      errors.push({ field: 'accountant', message: 'Accountant is required' });
    } else {
      completedFields++;
    }

    // Management Company (optional but counts toward completion if filled)
    if (data.managementCompany?.trim()) {
      completedFields++;
    }

    // Property Manager (optional but counts toward completion if filled)
    if (data.propertyManager?.trim()) {
      completedFields++;
    }

    return {
      isValid: errors.length === 0,
      errors,
      completedFields,
      totalFields
    };
  }

  /**
   * Validates Step 2: Building Data
   */
  static validateBuildingsStep(data: OnboardingPropertyData): StepValidation {
    const errors: FieldError[] = [];
    let completedFields = 0;
    let totalFields = 0;

    if (!data.buildings || data.buildings.length === 0) {
      errors.push({ field: 'buildings', message: 'At least one building is required' });
      return { isValid: false, errors, completedFields: 0, totalFields: 1 };
    }

    // Validate each building
    data.buildings.forEach((building, buildingIndex) => {
      const buildingFieldsCount = 4; // address, floors, buildingType, constructionYear
      totalFields += buildingFieldsCount;

      // Building address fields (check individual components)
      const hasStreetName = building.streetName?.trim()
      const hasHouseNumber = building.houseNumber?.trim()
      const hasPostalCode = building.postalCode?.trim()
      const hasCity = building.city?.trim()
      
      if (!hasStreetName) {
        errors.push({ 
          field: `buildings[${buildingIndex}].streetName`, 
          message: `Building ${buildingIndex + 1} street name is required` 
        });
      }
      
      if (!hasHouseNumber) {
        errors.push({ 
          field: `buildings[${buildingIndex}].houseNumber`, 
          message: `Building ${buildingIndex + 1} house number is required` 
        });
      }
      
      if (!hasPostalCode) {
        errors.push({ 
          field: `buildings[${buildingIndex}].postalCode`, 
          message: `Building ${buildingIndex + 1} postal code is required` 
        });
      }
      
      if (!hasCity) {
        errors.push({ 
          field: `buildings[${buildingIndex}].city`, 
          message: `Building ${buildingIndex + 1} city is required` 
        });
      }
      
      if (hasStreetName && hasHouseNumber && hasPostalCode && hasCity) {
        completedFields++;
      }

      // Floors
      if (!building.floors || building.floors < 1 || building.floors > 50) {
        errors.push({ 
          field: `buildings[${buildingIndex}].floors`, 
          message: `Building ${buildingIndex + 1} must have 1-50 floors` 
        });
      } else {
        completedFields++;
      }

      // Building Type
      if (!building.buildingType) {
        errors.push({ 
          field: `buildings[${buildingIndex}].buildingType`, 
          message: `Building ${buildingIndex + 1} type is required` 
        });
      } else {
        completedFields++;
      }

      // Construction Year
      const currentYear = new Date().getFullYear();
      if (!building.constructionYear || building.constructionYear < 1800 || building.constructionYear > currentYear) {
        errors.push({ 
          field: `buildings[${buildingIndex}].constructionYear`, 
          message: `Building ${buildingIndex + 1} construction year must be between 1800 and ${currentYear}` 
        });
      } else {
        completedFields++;
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      completedFields,
      totalFields
    };
  }

  /**
   * Validates Step 3: Units Data
   */
  static validateUnitsStep(data: OnboardingPropertyData): StepValidation {
    const errors: FieldError[] = [];
    let completedFields = 0;
    let totalFields = 0;

    console.log('validateUnitsStep called with:', {
      propertyType: data.type,
      buildingCount: data.buildings?.length || 0,
      hasBuildings: !!data.buildings
    });

    if (!data.buildings || data.buildings.length === 0) {
      errors.push({ field: 'buildings', message: 'Buildings must be defined before adding units' });
      return { isValid: false, errors, completedFields: 0, totalFields: 1 };
    }

    let totalUnitsExpected = 0;
    let totalUnitsFound = 0;
    
    // Check that ALL buildings have at least one unit (for WEG, this is strict; for MV, we can be more lenient)
    const buildingsWithoutUnits = data.buildings.filter(b => !b.units || b.units.length === 0);
    
    console.log('validateUnitsStep - detailed check:', {
      propertyType: data.type,
      totalBuildings: data.buildings.length,
      buildingsWithoutUnits: buildingsWithoutUnits.length,
      buildingDetails: data.buildings.map(b => ({
        id: b.id,
        address: `${b.streetName || ''} ${b.houseNumber || ''}, ${b.postalCode || ''} ${b.city || ''}`.trim(),
        hasUnits: !!(b.units && b.units.length > 0),
        unitCount: b.units?.length || 0,
        units: b.units?.slice(0, 2).map(u => ({
          unitNumber: u.unitNumber,
          type: u.type,
          floor: u.floor,
          size: u.size,
          rooms: u.rooms,
          rent: u.currentRent !== undefined ? u.currentRent : u.rent,
          hasRent: u.currentRent !== undefined || u.rent !== undefined
        }))
      }))
    });
    
    // For MV properties, allow completion even if some buildings don't have units yet
    // For WEG properties, all buildings must have units
    if (data.type === 'WEG' && buildingsWithoutUnits.length > 0) {
      errors.push({ 
        field: 'units', 
        message: `All buildings must have at least one unit for WEG properties. ${buildingsWithoutUnits.length} building(s) are missing units.` 
      });
      return { 
        isValid: false, 
        errors, 
        completedFields: 0, 
        totalFields: data.buildings.length 
      };
    } else if (data.type === 'MV') {
      // For MV properties, we need at least one building with units
      const buildingsWithUnits = data.buildings.filter(b => b.units && b.units.length > 0);
      if (buildingsWithUnits.length === 0) {
        errors.push({ 
          field: 'units', 
          message: `At least one building must have units for MV properties.` 
        });
        return { 
          isValid: false, 
          errors, 
          completedFields: 0, 
          totalFields: 1 
        };
      }
    }

    data.buildings.forEach((building, buildingIndex) => {
      // For MV properties, skip validation for buildings without units
      // For WEG properties, all buildings should have units (enforced above)
      if (!building.units || building.units.length === 0) {
        if (data.type === 'WEG') {
          // This shouldn't happen due to check above, but keep for safety
          return;
        } else {
          // For MV, skip buildings without units
          return;
        }
      }

      totalUnitsExpected += building.units.length;
      
      building.units.forEach((unit, unitIndex) => {
        const unitFieldsCount = data.type === 'WEG' ? 5 : 4; // unitNumber, floor, size, rooms, + (ownershipShare OR currentRent)
        totalFields += unitFieldsCount;

        // Unit Number
        const unitNumberStr = unit.unitNumber != null ? String(unit.unitNumber) : '';
        if (!unitNumberStr.trim()) {
          errors.push({ 
            field: `buildings[${buildingIndex}].units[${unitIndex}].unitNumber`, 
            message: `Building ${buildingIndex + 1}, Unit ${unitIndex + 1} number is required` 
          });
        } else {
          completedFields++;
        }

        // Floor
        if (unit.floor === undefined || unit.floor < 0 || unit.floor > (building.floors || 1)) {
          errors.push({ 
            field: `buildings[${buildingIndex}].units[${unitIndex}].floor`, 
            message: `Building ${buildingIndex + 1}, Unit ${unitIndex + 1} floor must be between 0 and ${building.floors || 1}` 
          });
        } else {
          completedFields++;
        }

        // Size
        if (!unit.size || unit.size < 15 || unit.size > 500) {
          errors.push({ 
            field: `buildings[${buildingIndex}].units[${unitIndex}].size`, 
            message: `Building ${buildingIndex + 1}, Unit ${unitIndex + 1} size must be between 15-500 m²` 
          });
        } else {
          completedFields++;
        }

        // Rooms
        if (!unit.rooms || unit.rooms < 1 || unit.rooms > 10) {
          errors.push({ 
            field: `buildings[${buildingIndex}].units[${unitIndex}].rooms`, 
            message: `Building ${buildingIndex + 1}, Unit ${unitIndex + 1} must have 1-10 rooms` 
          });
        } else {
          completedFields++;
        }

        // Property-type specific validation
        if (data.type === 'WEG') {
          // Ownership Share
          if (unit.ownershipShare === undefined || unit.ownershipShare <= 0) {
            errors.push({ 
              field: `buildings[${buildingIndex}].units[${unitIndex}].ownershipShare`, 
              message: `Building ${buildingIndex + 1}, Unit ${unitIndex + 1} ownership share is required for WEG properties` 
            });
          } else {
            completedFields++;
          }
        } else if (data.type === 'MV') {
          // Current Rent - check both currentRent and rent fields for compatibility
          const rentValue = unit.currentRent !== undefined ? unit.currentRent : unit.rent;
          if (rentValue === undefined || rentValue < 0) {
            errors.push({ 
              field: `buildings[${buildingIndex}].units[${unitIndex}].currentRent`, 
              message: `Building ${buildingIndex + 1}, Unit ${unitIndex + 1} rent is required for MV properties` 
            });
          } else {
            completedFields++;
          }
        }

        totalUnitsFound++;
      });
    });

    // WEG-specific validation: ownership shares should sum to 100.000
    // Allow tolerance of ±0.1% for floating point precision
    if (data.type === 'WEG' && totalUnitsFound > 0) {
      const totalOwnership = data.buildings
        .flatMap(b => b.units || [])
        .reduce((sum, unit) => sum + (unit.ownershipShare || 0), 0);
      
      const TOLERANCE = 0.1; // Allow ±0.1% deviation
      const difference = Math.abs(totalOwnership - 100);
      
      // Only block if the difference is more than the tolerance
      if (difference > TOLERANCE) {
        errors.push({ 
          field: 'ownershipShares', 
          message: `Total ownership shares must be within ${TOLERANCE}% of 100% (currently ${totalOwnership.toFixed(3)}%)` 
        });
      }
    }

    // Check for duplicate unit numbers within each building
    data.buildings.forEach((building, buildingIndex) => {
      if (!building.units) return;
      
      const unitNumbers = building.units.map(u => {
        const numStr = u.unitNumber != null ? String(u.unitNumber) : '';
        return numStr.trim().toLowerCase();
      }).filter(Boolean);
      const duplicates = unitNumbers.filter((num, index) => unitNumbers.indexOf(num) !== index);
      
      if (duplicates.length > 0) {
        errors.push({ 
          field: `buildings[${buildingIndex}].units`, 
          message: `Building ${buildingIndex + 1} has duplicate unit numbers: ${duplicates.join(', ')}` 
        });
      }
    });

    const result = {
      isValid: errors.length === 0,
      errors,
      completedFields,
      totalFields
    };
    
    console.log('validateUnitsStep FINAL result:', {
      propertyType: data.type,
      isValid: result.isValid,
      errorCount: errors.length,
      allErrors: errors, // Show ALL errors to debug
      completedFields,
      totalFields
    });
    
    return result;
  }

  /**
   * Validates all steps and returns overall completion status
   */
  static validateAllSteps(data: OnboardingPropertyData): {
    step1: StepValidation;
    step2: StepValidation;
    step3: StepValidation;
    overallComplete: boolean;
  } {
    const step1 = this.validatePropertyStep(data);
    const step2 = this.validateBuildingsStep(data);
    const step3 = this.validateUnitsStep(data);
    
    return {
      step1,
      step2,
      step3,
      overallComplete: step1.isValid && step2.isValid && step3.isValid
    };
  }

  /**
   * Quick validation for autosave (less strict)
   */
  static validateForAutosave(data: OnboardingPropertyData): boolean {
    // Allow saving as long as we have basic property info
    return !!(data.name?.trim() && data.type);
  }

  /**
   * Get validation summary for progress indicators
   */
  static getProgressSummary(data: OnboardingPropertyData): {
    step1Progress: number;
    step2Progress: number;
    step3Progress: number;
    overallProgress: number;
  } {
    const step1 = this.validatePropertyStep(data);
    const step2 = this.validateBuildingsStep(data);
    const step3 = this.validateUnitsStep(data);
    
    const step1Progress = step1.totalFields > 0 ? (step1.completedFields / step1.totalFields) * 100 : 0;
    const step2Progress = step2.totalFields > 0 ? (step2.completedFields / step2.totalFields) * 100 : 0;
    const step3Progress = step3.totalFields > 0 ? (step3.completedFields / step3.totalFields) * 100 : 0;
    
    const overallProgress = (step1Progress + step2Progress + step3Progress) / 3;
    
    return {
      step1Progress: Math.round(step1Progress),
      step2Progress: Math.round(step2Progress),
      step3Progress: Math.round(step3Progress),
      overallProgress: Math.round(overallProgress)
    };
  }
}