import { Test, TestingModule } from '@nestjs/testing';
import { PropertyRepository } from './property.repository';
import { Property } from '../interfaces/property.interface';

describe('PropertyRepository', () => {
  let repository: PropertyRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PropertyRepository],
    }).compile();

    repository = module.get<PropertyRepository>(PropertyRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all properties', async () => {
      const properties = await repository.findAll();
      expect(properties).toBeDefined();
      expect(Array.isArray(properties)).toBe(true);
      expect(properties.length).toBeGreaterThan(0);
    });

    it('should return copies of properties (not references)', async () => {
      const properties1 = await repository.findAll();
      const properties2 = await repository.findAll();

      expect(properties1).not.toBe(properties2);
      expect(properties1[0]).not.toBe(properties2[0]);
    });
  });

  describe('findById', () => {
    it('should find existing property by ID', async () => {
      const allProperties = await repository.findAll();
      const firstProperty = allProperties[0];

      const foundProperty = await repository.findById(firstProperty.id);

      expect(foundProperty).toBeDefined();
      expect(foundProperty?.id).toBe(firstProperty.id);
      expect(foundProperty?.name).toBe(firstProperty.name);
    });

    it('should return null for non-existent ID', async () => {
      const foundProperty = await repository.findById('non-existent-id');
      expect(foundProperty).toBeNull();
    });

    it('should return a copy of the property (not reference)', async () => {
      const allProperties = await repository.findAll();
      const firstProperty = allProperties[0];

      const foundProperty = await repository.findById(firstProperty.id);

      expect(foundProperty).not.toBe(firstProperty);
    });
  });

  describe('create', () => {
    it('should create a new property', async () => {
      const newProperty: Property = {
        id: 'test-id',
        name: 'Test Property',
        type: 'WEG',
        propertyNumber: 'TEST-001',
        address: 'Test Address',
        buildings: [],
        unitCount: 0,
        lastModified: new Date().toISOString(),
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const createdProperty = await repository.create(newProperty);

      expect(createdProperty).toBeDefined();
      expect(createdProperty.id).toBe(newProperty.id);
      expect(createdProperty.name).toBe(newProperty.name);
      expect(createdProperty).not.toBe(newProperty); // Should be a copy
    });

    it('should add property to the collection', async () => {
      const initialCount = await repository.count();

      const newProperty: Property = {
        id: 'test-id-2',
        name: 'Test Property 2',
        type: 'MV',
        propertyNumber: 'TEST-002',
        address: 'Test Address 2',
        buildings: [],
        unitCount: 0,
        lastModified: new Date().toISOString(),
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await repository.create(newProperty);

      const finalCount = await repository.count();
      expect(finalCount).toBe(initialCount + 1);

      const foundProperty = await repository.findById('test-id-2');
      expect(foundProperty).toBeDefined();
      expect(foundProperty?.name).toBe('Test Property 2');
    });
  });

  describe('update', () => {
    it('should update existing property', async () => {
      const allProperties = await repository.findAll();
      const propertyToUpdate = allProperties[0];

      const updatedProperty: Property = {
        ...propertyToUpdate,
        name: 'Updated Property Name',
        lastModified: new Date().toISOString(),
      };

      const result = await repository.update(
        propertyToUpdate.id,
        updatedProperty,
      );

      expect(result).toBeDefined();
      expect(result?.name).toBe('Updated Property Name');
      expect(result?.id).toBe(propertyToUpdate.id);
    });

    it('should return null for non-existent property', async () => {
      const nonExistentProperty: Property = {
        id: 'non-existent',
        name: 'Non-existent',
        type: 'WEG',
        propertyNumber: 'NE-001',
        address: 'Non-existent Address',
        buildings: [],
        unitCount: 0,
        lastModified: new Date().toISOString(),
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = await repository.update(
        'non-existent',
        nonExistentProperty,
      );
      expect(result).toBeNull();
    });

    it('should persist the update', async () => {
      const allProperties = await repository.findAll();
      const propertyToUpdate = allProperties[0];

      const updatedProperty: Property = {
        ...propertyToUpdate,
        name: 'Persisted Update Test',
        lastModified: new Date().toISOString(),
      };

      await repository.update(propertyToUpdate.id, updatedProperty);

      const foundProperty = await repository.findById(propertyToUpdate.id);
      expect(foundProperty?.name).toBe('Persisted Update Test');
    });
  });

  describe('delete', () => {
    it('should delete existing property', async () => {
      const newProperty: Property = {
        id: 'delete-test',
        name: 'Property to Delete',
        type: 'WEG',
        propertyNumber: 'DEL-001',
        address: 'Delete Test Address',
        buildings: [],
        unitCount: 0,
        lastModified: new Date().toISOString(),
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await repository.create(newProperty);

      const deleteResult = await repository.delete('delete-test');
      expect(deleteResult).toBe(true);

      const foundProperty = await repository.findById('delete-test');
      expect(foundProperty).toBeNull();
    });

    it('should return false for non-existent property', async () => {
      const deleteResult = await repository.delete('non-existent');
      expect(deleteResult).toBe(false);
    });
  });

  describe('count', () => {
    it('should return correct count of properties', async () => {
      const properties = await repository.findAll();
      const count = await repository.count();

      expect(count).toBe(properties.length);
    });

    it('should update count after adding property', async () => {
      const initialCount = await repository.count();

      const newProperty: Property = {
        id: 'count-test',
        name: 'Count Test Property',
        type: 'WEG',
        propertyNumber: 'COUNT-001',
        address: 'Count Test Address',
        buildings: [],
        unitCount: 0,
        lastModified: new Date().toISOString(),
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await repository.create(newProperty);

      const finalCount = await repository.count();
      expect(finalCount).toBe(initialCount + 1);
    });
  });

  describe('findByType', () => {
    it('should find properties by WEG type', async () => {
      const wegProperties = await repository.findByType('WEG');

      expect(Array.isArray(wegProperties)).toBe(true);
      wegProperties.forEach((property) => {
        expect(property.type).toBe('WEG');
      });
    });

    it('should find properties by MV type', async () => {
      const mvProperties = await repository.findByType('MV');

      expect(Array.isArray(mvProperties)).toBe(true);
      mvProperties.forEach((property) => {
        expect(property.type).toBe('MV');
      });
    });

    it('should return copies of properties', async () => {
      const wegProperties1 = await repository.findByType('WEG');
      const wegProperties2 = await repository.findByType('WEG');

      if (wegProperties1.length > 0 && wegProperties2.length > 0) {
        expect(wegProperties1[0]).not.toBe(wegProperties2[0]);
      }
    });
  });

  describe('findByStatus', () => {
    it('should find properties by active status', async () => {
      const activeProperties = await repository.findByStatus('active');

      expect(Array.isArray(activeProperties)).toBe(true);
      activeProperties.forEach((property) => {
        expect(property.status).toBe('active');
      });
    });

    it('should find properties by archived status', async () => {
      // First create an archived property
      const archivedProperty: Property = {
        id: 'archived-test',
        name: 'Archived Property',
        type: 'WEG',
        propertyNumber: 'ARCH-001',
        address: 'Archived Address',
        buildings: [],
        unitCount: 0,
        lastModified: new Date().toISOString(),
        status: 'archived',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await repository.create(archivedProperty);

      const archivedProperties = await repository.findByStatus('archived');

      expect(Array.isArray(archivedProperties)).toBe(true);
      expect(archivedProperties.length).toBeGreaterThan(0);
      archivedProperties.forEach((property) => {
        expect(property.status).toBe('archived');
      });
    });
  });

  describe('executeTransaction', () => {
    it('should execute operation successfully', async () => {
      const result = await repository.executeTransaction(async () => {
        const properties = await repository.findAll();
        return properties.length;
      });

      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
    });

    it('should rollback on error', async () => {
      const initialProperties = await repository.findAll();
      const initialCount = initialProperties.length;

      const testProperty: Property = {
        id: 'transaction-test',
        name: 'Transaction Test',
        type: 'WEG',
        propertyNumber: 'TRANS-001',
        address: 'Transaction Address',
        buildings: [],
        unitCount: 0,
        lastModified: new Date().toISOString(),
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        await repository.executeTransaction(async () => {
          await repository.create(testProperty);
          // Simulate an error
          throw new Error('Transaction failed');
        });
      } catch (error) {
        expect(error.message).toBe('Transaction failed');
      }

      // Check that the property was rolled back
      const finalCount = await repository.count();
      expect(finalCount).toBe(initialCount);

      const foundProperty = await repository.findById('transaction-test');
      expect(foundProperty).toBeNull();
    });
  });
});
