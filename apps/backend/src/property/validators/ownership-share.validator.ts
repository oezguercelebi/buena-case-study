import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsOwnershipShareValid(propertyType?: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isOwnershipShareValid',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(buildings: any[], args: ValidationArguments) {
          // Only validate for WEG properties
          const targetObject = args.object as any;
          if (targetObject.type === 'MV') {
            return true; // Skip validation for MV properties
          }

          if (!Array.isArray(buildings) || buildings.length === 0) {
            return true; // Skip if no buildings
          }

          // Validate that all units in all buildings have ownership shares
          for (const building of buildings) {
            if (!building.units || !Array.isArray(building.units)) {
              continue;
            }

            const units = building.units;
            const totalShares = units.reduce((sum: number, unit: any) => {
              if (typeof unit.ownershipShare !== 'number' || unit.ownershipShare <= 0) {
                return NaN; // Invalid share
              }
              return sum + unit.ownershipShare;
            }, 0);

            // Allow for floating point precision errors with 0.1% tolerance
            if (isNaN(totalShares) || Math.abs(totalShares - 100) > 0.1) {
              return false;
            }
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return 'For WEG properties, ownership shares in each building must sum to 100% (±0.1% tolerance)';
        },
      },
    });
  };
}

export function HasValidRent(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'hasValidRent',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(buildings: any[], args: ValidationArguments) {
          // Only validate for MV properties
          const targetObject = args.object as any;
          if (targetObject.type === 'WEG') {
            return true; // Skip validation for WEG properties
          }

          if (!Array.isArray(buildings) || buildings.length === 0) {
            return true; // Skip if no buildings
          }

          // Validate that all units in MV properties have rent values
          for (const building of buildings) {
            if (!building.units || !Array.isArray(building.units)) {
              continue;
            }

            const units = building.units;
            for (const unit of units) {
              if (typeof unit.rent !== 'number' || unit.rent < 0) {
                return false;
              }
            }
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return 'For MV properties, all units must have valid rent values (≥ 0)';
        },
      },
    });
  };
}

export function HasUniqueUnitNumbers(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'hasUniqueUnitNumbers',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(buildings: any[], args: ValidationArguments) {
          if (!Array.isArray(buildings) || buildings.length === 0) {
            return true; // Skip if no buildings
          }

          // Check unit number uniqueness within each building
          for (const building of buildings) {
            if (!building.units || !Array.isArray(building.units)) {
              continue;
            }

            const unitNumbers = new Set<string>();
            for (const unit of building.units) {
              if (!unit.unitNumber || typeof unit.unitNumber !== 'string') {
                continue;
              }

              if (unitNumbers.has(unit.unitNumber)) {
                return false; // Duplicate unit number found
              }
              unitNumbers.add(unit.unitNumber);
            }
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Unit numbers must be unique within each building';
        },
      },
    });
  };
}