import { Test, TestingModule } from '@nestjs/testing';
import { ValidationService, ValidationResult } from './validation.service';
import { Property, Building, Unit } from '../interfaces/property.interface';
import {
  GeneralInfoStepDto,
  BuildingDataStepDto,
  UnitsDataStepDto,
} from '../dto/update-step.dto';

describe('ValidationService', () => {
  let service: ValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValidationService],
    }).compile();

    service = module.get<ValidationService>(ValidationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateProperty', () => {
    it('should validate a complete WEG property successfully', () => {
      const property: Property = {
        id: '1',
        name: 'Test Property',
        type: 'WEG',
        propertyNumber: 'WEG-001',
        address: 'Test Street 1, 12345 Berlin',
        buildings: [
          {
            streetName: 'Test Street',
            houseNumber: '1',
            postalCode: '12345',
            city: 'Berlin',
            buildingType: 'altbau',
            floors: 2,
            unitsPerFloor: 2,
            units: [
              {
                unitNumber: '1A',
                floor: 0,
                type: 'apartment',
                rooms: 3,
                size: 85,
                ownershipShare: 50,
                owner: 'Test Owner 1',
              },
              {
                unitNumber: '1B',
                floor: 0,
                type: 'apartment',
                rooms: 2,
                size: 65,
                ownershipShare: 50,
                owner: 'Test Owner 2',
              },
            ],
          },
        ],
        unitCount: 2,
        lastModified: new Date().toISOString(),
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = service.validateProperty(property);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for property with invalid ownership shares', () => {
      const property: Property = {
        id: '1',
        name: 'Test Property',
        type: 'WEG',
        propertyNumber: 'WEG-001',
        address: 'Test Street 1, 12345 Berlin',
        buildings: [
          {
            streetName: 'Test Street',
            houseNumber: '1',
            postalCode: '12345',
            city: 'Berlin',
            buildingType: 'altbau',
            floors: 2,
            unitsPerFloor: 2,
            units: [
              {
                unitNumber: '1A',
                floor: 0,
                type: 'apartment',
                rooms: 3,
                size: 85,
                ownershipShare: 60,
                owner: 'Test Owner 1',
              },
              {
                unitNumber: '1B',
                floor: 0,
                type: 'apartment',
                rooms: 2,
                size: 65,
                ownershipShare: 60,
                owner: 'Test Owner 2',
              },
            ],
          },
        ],
        unitCount: 2,
        lastModified: new Date().toISOString(),
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = service.validateProperty(property);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Building 1: Total ownership shares (120.00%) must sum to 100% (±0.1% tolerance)',
      );
    });

    it('should fail validation for property with missing required fields', () => {
      const property: Property = {
        id: '1',
        name: '',
        type: 'WEG',
        propertyNumber: '',
        address: '',
        buildings: [],
        unitCount: 0,
        lastModified: new Date().toISOString(),
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = service.validateProperty(property);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Property name is required');
      expect(result.errors).toContain('Property address is required');
      expect(result.errors).toContain('Property number is required');
    });
  });

  describe('validateBuilding', () => {
    it('should validate a complete building successfully', () => {
      const building: Building = {
        streetName: 'Test Street',
        houseNumber: '1',
        postalCode: '12345',
        city: 'Berlin',
        buildingType: 'altbau',
        floors: 2,
        unitsPerFloor: 1,
        units: [
          {
            unitNumber: '1A',
            floor: 0,
            type: 'apartment',
            rooms: 3,
            size: 85,
            ownershipShare: 100,
            owner: 'Test Owner',
          },
        ],
      };

      const result = service.validateBuilding(building, 'WEG');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for building with missing address fields', () => {
      const building: Building = {
        streetName: '',
        houseNumber: '',
        postalCode: '',
        city: '',
        buildingType: 'altbau',
        floors: 0,
        unitsPerFloor: 0,
        units: [],
      };

      const result = service.validateBuilding(building, 'WEG');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Street name is required');
      expect(result.errors).toContain('House number is required');
      expect(result.errors).toContain('Postal code is required');
      expect(result.errors).toContain('City is required');
      expect(result.errors).toContain('Number of floors must be at least 1');
      expect(result.errors).toContain('Units per floor must be at least 1');
    });

    it('should warn about unusual construction year', () => {
      const building: Building = {
        streetName: 'Test Street',
        houseNumber: '1',
        postalCode: '12345',
        city: 'Berlin',
        buildingType: 'altbau',
        floors: 2,
        unitsPerFloor: 1,
        constructionYear: 1700,
        units: [],
      };

      const result = service.validateBuilding(building, 'WEG');

      expect(result.warnings).toContain('Construction year 1700 seems unusual');
    });
  });

  describe('validateUnits', () => {
    it('should validate WEG units with correct ownership shares', () => {
      const units: Unit[] = [
        {
          unitNumber: '1A',
          floor: 0,
          type: 'apartment',
          rooms: 3,
          size: 85,
          ownershipShare: 50,
          owner: 'Owner 1',
        },
        {
          unitNumber: '1B',
          floor: 0,
          type: 'apartment',
          rooms: 2,
          size: 65,
          ownershipShare: 50,
          owner: 'Owner 2',
        },
      ];

      const result = service.validateUnits(units, 'WEG');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate MV units with valid rent', () => {
      const units: Unit[] = [
        {
          unitNumber: '1A',
          floor: 0,
          type: 'apartment',
          rooms: 3,
          size: 85,
          rent: 1200,
          tenant: 'Tenant 1',
        },
        {
          unitNumber: '1B',
          floor: 0,
          type: 'apartment',
          rooms: 2,
          size: 65,
          rent: 1000,
        },
      ];

      const result = service.validateUnits(units, 'MV');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for WEG units with incorrect ownership share sum', () => {
      const units: Unit[] = [
        {
          unitNumber: '1A',
          floor: 0,
          type: 'apartment',
          rooms: 3,
          size: 85,
          ownershipShare: 60,
          owner: 'Owner 1',
        },
        {
          unitNumber: '1B',
          floor: 0,
          type: 'apartment',
          rooms: 2,
          size: 65,
          ownershipShare: 60,
          owner: 'Owner 2',
        },
      ];

      const result = service.validateUnits(units, 'WEG');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Total ownership shares (120.00%) must sum to 100% (±0.1% tolerance)',
      );
    });

    it('should warn about unusually large unit size', () => {
      const units: Unit[] = [
        {
          unitNumber: '1A',
          floor: 0,
          type: 'apartment',
          rooms: 20,
          size: 15000,
          ownershipShare: 100,
          owner: 'Owner 1',
        },
      ];

      const result = service.validateUnits(units, 'WEG');

      expect(result.warnings).toContain(
        'Unit 1: Size 15000 m² is unusually large',
      );
    });

    it('should warn about unusually high rent', () => {
      const units: Unit[] = [
        {
          unitNumber: '1A',
          floor: 0,
          type: 'apartment',
          rooms: 3,
          size: 85,
          rent: 75000,
        },
      ];

      const result = service.validateUnits(units, 'MV');

      expect(result.warnings).toContain(
        'Unit 1: Rent 75000€ is unusually high',
      );
    });
  });

  describe('step completion validation', () => {
    describe('isStep1Complete', () => {
      it('should return true for complete general info', () => {
        const data: GeneralInfoStepDto = {
          name: 'Test Property',
          type: 'WEG',
          address: 'Test Address',
          propertyNumber: 'WEG-001',
        };

        expect(service.isStep1Complete(data)).toBe(true);
      });

      it('should return false for incomplete general info', () => {
        const data: GeneralInfoStepDto = {
          name: 'Test Property',
          type: 'WEG',
          // missing address
        };

        expect(service.isStep1Complete(data)).toBe(false);
      });
    });

    describe('isStep2Complete', () => {
      it('should return true for complete building data', () => {
        const data: BuildingDataStepDto = {
          buildings: [
            {
              streetName: 'Test Street',
              houseNumber: '1',
              postalCode: '12345',
              city: 'Berlin',
              buildingType: 'altbau',
              floors: 2,
              unitsPerFloor: 2,
            },
          ],
        };

        expect(service.isStep2Complete(data)).toBe(true);
      });

      it('should return false for incomplete building data', () => {
        const data: BuildingDataStepDto = {
          buildings: [
            {
              streetName: 'Test Street',
              // missing other required fields
            },
          ],
        };

        expect(service.isStep2Complete(data)).toBe(false);
      });
    });

    describe('isStep3Complete', () => {
      it('should return true for complete WEG units data', () => {
        const data: UnitsDataStepDto = {
          buildings: [
            {
              units: [
                {
                  unitNumber: '1A',
                  type: 'apartment',
                  rooms: 3,
                  size: 85,
                  ownershipShare: 100,
                  owner: 'Test Owner',
                },
              ],
            },
          ],
        };

        expect(service.isStep3Complete(data, 'WEG')).toBe(true);
      });

      it('should return true for complete MV units data', () => {
        const data: UnitsDataStepDto = {
          buildings: [
            {
              units: [
                {
                  unitNumber: '1A',
                  type: 'apartment',
                  rooms: 3,
                  size: 85,
                  rent: 1200,
                },
              ],
            },
          ],
        };

        expect(service.isStep3Complete(data, 'MV')).toBe(true);
      });

      it('should return false for incomplete units data', () => {
        const data: UnitsDataStepDto = {
          buildings: [
            {
              units: [
                {
                  unitNumber: '1A',
                  type: 'apartment',
                  // missing required fields
                },
              ],
            },
          ],
        };

        expect(service.isStep3Complete(data, 'WEG')).toBe(false);
      });
    });
  });

  describe('calculateCompletionPercentage', () => {
    it('should return 0 for empty property', () => {
      const property: Property = {
        id: '1',
        name: '',
        type: 'WEG',
        propertyNumber: '',
        address: '',
        buildings: [],
        unitCount: 0,
        lastModified: new Date().toISOString(),
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(service.calculateCompletionPercentage(property)).toBe(0);
    });

    it('should return 33 for property with only general info', () => {
      const property: Property = {
        id: '1',
        name: 'Test Property',
        type: 'WEG',
        propertyNumber: 'WEG-001',
        address: 'Test Address',
        buildings: [],
        unitCount: 0,
        lastModified: new Date().toISOString(),
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(service.calculateCompletionPercentage(property)).toBe(33);
    });

    it('should return 100 for complete property', () => {
      const property: Property = {
        id: '1',
        name: 'Test Property',
        type: 'WEG',
        propertyNumber: 'WEG-001',
        address: 'Test Address',
        buildings: [
          {
            streetName: 'Test Street',
            houseNumber: '1',
            postalCode: '12345',
            city: 'Berlin',
            buildingType: 'altbau',
            floors: 1,
            unitsPerFloor: 1,
            units: [
              {
                unitNumber: '1A',
                floor: 0,
                type: 'apartment',
                rooms: 3,
                size: 85,
                ownershipShare: 100,
                owner: 'Test Owner',
              },
            ],
          },
        ],
        unitCount: 1,
        lastModified: new Date().toISOString(),
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(service.calculateCompletionPercentage(property)).toBe(100);
    });
  });

  describe('updateProgressTracking', () => {
    it('should update completion percentage and completed flag', async () => {
      const property: Property = {
        id: '1',
        name: 'Test Property',
        type: 'WEG',
        propertyNumber: 'WEG-001',
        address: 'Test Address',
        buildings: [
          {
            streetName: 'Test Street',
            houseNumber: '1',
            postalCode: '12345',
            city: 'Berlin',
            buildingType: 'altbau',
            floors: 1,
            unitsPerFloor: 1,
            units: [
              {
                unitNumber: '1A',
                floor: 0,
                type: 'apartment',
                rooms: 3,
                size: 85,
                ownershipShare: 100,
                owner: 'Test Owner',
              },
            ],
          },
        ],
        unitCount: 1,
        lastModified: new Date().toISOString(),
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add a small delay to ensure timestamps are different
      await new Promise((resolve) => setTimeout(resolve, 1));

      const result = service.updateProgressTracking(property);

      expect(result.completionPercentage).toBe(100);
      expect(result.completed).toBe(true);
      expect(new Date(result.lastModified).getTime()).toBeGreaterThan(
        new Date(property.lastModified).getTime(),
      );
      expect(new Date(result.updatedAt).getTime()).toBeGreaterThan(
        new Date(property.updatedAt).getTime(),
      );
    });
  });
});
