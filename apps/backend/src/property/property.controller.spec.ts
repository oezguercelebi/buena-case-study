import { Test, TestingModule } from '@nestjs/testing';
import { PropertyController } from './property.controller';
import { PropertyService } from './property.service';
import { ValidationService } from './services/validation.service';
import { PropertyRepository } from './repository/property.repository';
import { CreatePropertyDto } from './dto/create-property.dto';
import { AutosavePropertyDto } from './dto/update-step.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('PropertyController', () => {
  let controller: PropertyController;
  let service: PropertyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertyController],
      providers: [PropertyService, ValidationService, PropertyRepository],
    }).compile();

    controller = module.get<PropertyController>(PropertyController);
    service = module.get<PropertyService>(PropertyService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all properties', async () => {
      const result = await controller.findAll();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // Check that each property has required fields
      result.forEach(property => {
        expect(property).toHaveProperty('id');
        expect(property).toHaveProperty('name');
        expect(property).toHaveProperty('type');
        expect(property).toHaveProperty('status');
      });
    });
  });

  describe('getStats', () => {
    it('should return property statistics', async () => {
      const stats = await controller.getStats();
      
      expect(stats).toHaveProperty('totalProperties');
      expect(stats).toHaveProperty('wegProperties');
      expect(stats).toHaveProperty('mvProperties');
      expect(stats).toHaveProperty('totalUnits');
      expect(stats).toHaveProperty('activeProperties');
      expect(stats).toHaveProperty('archivedProperties');
      expect(stats).toHaveProperty('averageUnitsPerProperty');
      expect(stats).toHaveProperty('completedProperties');
      expect(stats).toHaveProperty('inProgressProperties');
      expect(stats).toHaveProperty('notStartedProperties');
      expect(stats).toHaveProperty('averageCompletionPercentage');

      expect(typeof stats.totalProperties).toBe('number');
      expect(typeof stats.wegProperties).toBe('number');
      expect(typeof stats.mvProperties).toBe('number');
    });

    it('should have consistent statistics', async () => {
      const stats = await controller.getStats();
      
      // WEG + MV should equal total properties
      expect(stats.wegProperties + stats.mvProperties).toBe(stats.totalProperties);
      
      // Active + Archived should equal total properties
      expect(stats.activeProperties + stats.archivedProperties).toBe(stats.totalProperties);
      
      // Progress states should sum to total
      expect(
        stats.completedProperties + stats.inProgressProperties + stats.notStartedProperties
      ).toBe(stats.totalProperties);
    });
  });

  describe('findOne', () => {
    it('should return a specific property by ID', async () => {
      const allProperties = await controller.findAll();
      const firstProperty = allProperties[0];
      
      const result = await controller.findOne(firstProperty.id);
      
      expect(result).toBeDefined();
      expect(result.id).toBe(firstProperty.id);
      expect(result.name).toBe(firstProperty.name);
    });

    it('should return undefined for non-existent property', async () => {
      const result = await controller.findOne('non-existent-id');
      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should create a new WEG property', async () => {
      const createDto: CreatePropertyDto = {
        name: 'Test WEG Property',
        type: 'WEG',
        propertyNumber: 'TEST-WEG-001',
        address: 'Test Street 1, 12345 Test City',
        buildings: [
          {
            streetName: 'Test Street',
            houseNumber: '1',
            postalCode: '12345',
            city: 'Test City',
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
                ownershipShare: 50,
                owner: 'Test Owner 1',
              },
              {
                unitNumber: '2A',
                floor: 1,
                type: 'apartment',
                rooms: 2,
                size: 65,
                ownershipShare: 50,
                owner: 'Test Owner 2',
              },
            ],
          },
        ],
      };

      const result = await controller.create(createDto);
      
      expect(result).toBeDefined();
      expect(result.name).toBe(createDto.name);
      expect(result.type).toBe('WEG');
      expect(result.unitCount).toBe(2);
      expect(result.buildings).toHaveLength(1);
      expect(result.buildings[0].units).toHaveLength(2);
    });

    it('should create a new MV property', async () => {
      const createDto: CreatePropertyDto = {
        name: 'Test MV Property',
        type: 'MV',
        propertyNumber: 'TEST-MV-001',
        address: 'Test Street 2, 12345 Test City',
        buildings: [
          {
            streetName: 'Test Street',
            houseNumber: '2',
            postalCode: '12345',
            city: 'Test City',
            buildingType: 'neubau',
            floors: 3,
            unitsPerFloor: 1,
            units: [
              {
                unitNumber: '1A',
                floor: 0,
                type: 'apartment',
                rooms: 2,
                size: 60,
                rent: 1000,
                tenant: 'Test Tenant 1',
              },
              {
                unitNumber: '2A',
                floor: 1,
                type: 'apartment',
                rooms: 3,
                size: 80,
                rent: 1200,
              },
              {
                unitNumber: '3A',
                floor: 2,
                type: 'apartment',
                rooms: 1,
                size: 45,
                rent: 800,
                tenant: 'Test Tenant 2',
              },
            ],
          },
        ],
      };

      const result = await controller.create(createDto);
      
      expect(result).toBeDefined();
      expect(result.name).toBe(createDto.name);
      expect(result.type).toBe('MV');
      expect(result.unitCount).toBe(3);
      expect(result.buildings[0].units[0].rent).toBe(1000);
    });
  });

  describe('update', () => {
    it('should update an existing property', async () => {
      const allProperties = await controller.findAll();
      const propertyToUpdate = allProperties[0];
      
      const updateData = {
        name: 'Updated Property Name',
        managementCompany: 'Updated Management Company',
      };

      const result = await controller.update(propertyToUpdate.id, updateData);
      
      expect(result).toBeDefined();
      expect(result.name).toBe('Updated Property Name');
      expect(result.managementCompany).toBe('Updated Management Company');
      expect(result.id).toBe(propertyToUpdate.id);
      expect(result.type).toBe(propertyToUpdate.type); // Should preserve existing values
    });

    it('should return null for non-existent property update', async () => {
      const updateData = {
        name: 'This should not work',
      };

      const result = await controller.update('non-existent-id', updateData);
      expect(result).toBeNull();
    });
  });

  describe('autosave', () => {
    it('should autosave property data', async () => {
      const allProperties = await controller.findAll();
      const propertyToUpdate = allProperties[0];
      
      const autosaveData: AutosavePropertyDto = {
        name: 'Autosaved Property Name',
        managementCompany: 'Autosaved Management Company',
        currentStep: 2,
      };

      const result = await controller.autosave(propertyToUpdate.id, autosaveData);
      
      expect(result).toBeDefined();
      expect(result.name).toBe('Autosaved Property Name');
      expect(result.managementCompany).toBe('Autosaved Management Company');
      expect(result.currentStep).toBe(2);
    });

    it('should throw NotFoundException for non-existent property', async () => {
      const autosaveData: AutosavePropertyDto = {
        name: 'This should fail',
      };

      try {
        await controller.autosave('non-existent-id', autosaveData);
        fail('Should have thrown an exception');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('updateStep', () => {
    it('should update step 1 data', async () => {
      const allProperties = await controller.findAll();
      const property = allProperties[0];
      
      const stepData = {
        name: 'Updated Step 1 Name',
        type: 'WEG' as const,
        address: 'Updated Address',
        propertyNumber: 'UPDATED-001',
      };

      const result = await controller.updateStep(property.id, '1', stepData);
      
      expect(result).toBeDefined();
      expect(result.name).toBe('Updated Step 1 Name');
      expect(result.address).toBe('Updated Address');
      expect(result.propertyNumber).toBe('UPDATED-001');
    });

    it('should throw error for invalid step number', async () => {
      const allProperties = await controller.findAll();
      const property = allProperties[0];
      
      const stepData = {
        name: 'Should fail',
      };

      try {
        await controller.updateStep(property.id, '4', stepData);
        fail('Should have thrown an exception');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }

      try {
        await controller.updateStep(property.id, '0', stepData);
        fail('Should have thrown an exception');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('should throw error for non-existent property', async () => {
      const stepData = {
        name: 'Should fail',
      };

      try {
        await controller.updateStep('non-existent-id', '1', stepData);
        fail('Should have thrown an exception');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('deleteProperty', () => {
    it('should delete an existing property', async () => {
      // Create a test property first
      const createDto: CreatePropertyDto = {
        name: 'Property to Delete',
        type: 'WEG',
        propertyNumber: 'DELETE-TEST-001',
        address: 'Delete Street 1, 12345 Delete City',
        buildings: [],
      };

      const createdProperty = await controller.create(createDto);
      
      // Now delete it
      const result = await controller.deleteProperty(createdProperty.id);
      
      expect(result).toBeDefined();
      expect(result.message).toBe('Property deleted successfully');
      
      // Verify it's gone
      const foundProperty = await controller.findOne(createdProperty.id);
      expect(foundProperty).toBeUndefined();
    });

    it('should throw NotFoundException for non-existent property', async () => {
      try {
        await controller.deleteProperty('non-existent-id');
        fail('Should have thrown an exception');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(error.message).toBe('Property not found');
      }
    });
  });

  describe('error handling', () => {
    it('should handle service errors in autosave', async () => {
      // Mock the service to throw an error
      jest.spyOn(service, 'autosave').mockImplementation(() => {
        throw new Error('Service error');
      });

      const autosaveData: AutosavePropertyDto = {
        name: 'Error test',
      };

      try {
        await controller.autosave('test-id', autosaveData);
        fail('Should have thrown an exception');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }

      // Restore the original implementation
      jest.restoreAllMocks();
    });

    it('should handle service errors in updateStep', async () => {
      // Mock the service to throw an error
      jest.spyOn(service, 'updateStep').mockImplementation(() => {
        throw new Error('Step update error');
      });

      const stepData = {
        name: 'Error test',
      };

      try {
        await controller.updateStep('test-id', '1', stepData);
        fail('Should have thrown an exception');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }

      // Restore the original implementation
      jest.restoreAllMocks();
    });
  });
});