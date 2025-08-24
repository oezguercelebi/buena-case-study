import { Injectable } from '@nestjs/common';
import { Property } from '../interfaces/property.interface';

export interface IPropertyRepository {
  findAll(): Promise<Property[]>;
  findById(id: string): Promise<Property | null>;
  create(property: Property): Promise<Property>;
  update(id: string, property: Property): Promise<Property | null>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
  findByType(type: 'WEG' | 'MV'): Promise<Property[]>;
  findByStatus(status: 'active' | 'archived'): Promise<Property[]>;
}

@Injectable()
export class PropertyRepository implements IPropertyRepository {
  private properties: Property[] = [];

  constructor() {
    // Initialize with seed data
    this.initializeSeedData();
  }

  async findAll(): Promise<Property[]> {
    return this.properties.map(p => JSON.parse(JSON.stringify(p)));
  }

  async findById(id: string): Promise<Property | null> {
    const property = this.properties.find(p => p.id === id);
    return property ? JSON.parse(JSON.stringify(property)) : null;
  }

  async create(property: Property): Promise<Property> {
    const newProperty = { ...property };
    this.properties.push(newProperty);
    return { ...newProperty };
  }

  async update(id: string, property: Property): Promise<Property | null> {
    const index = this.properties.findIndex(p => p.id === id);
    if (index === -1) {
      return null;
    }

    this.properties[index] = { ...property };
    return { ...this.properties[index] };
  }

  async delete(id: string): Promise<boolean> {
    const index = this.properties.findIndex(p => p.id === id);
    if (index === -1) {
      return false;
    }

    this.properties.splice(index, 1);
    return true;
  }

  async count(): Promise<number> {
    return this.properties.length;
  }

  async findByType(type: 'WEG' | 'MV'): Promise<Property[]> {
    return this.properties.filter(p => p.type === type).map(p => JSON.parse(JSON.stringify(p)));
  }

  async findByStatus(status: 'active' | 'archived'): Promise<Property[]> {
    return this.properties.filter(p => p.status === status).map(p => JSON.parse(JSON.stringify(p)));
  }

  // Transaction-like operations for atomicity
  async executeTransaction<T>(operation: () => Promise<T>): Promise<T> {
    // In a real database, this would start a transaction
    // For in-memory implementation, we'll simulate this with try/catch
    const snapshot = JSON.parse(JSON.stringify(this.properties));
    
    try {
      return await operation();
    } catch (error) {
      // Rollback on error
      this.properties = snapshot;
      throw error;
    }
  }

  private initializeSeedData(): void {
    const seedProperties: Property[] = [
      {
        id: '1',
        name: 'Berliner Straße 42',
        type: 'WEG',
        propertyNumber: 'WEG-2025-001',
        managementCompany: 'Hausverwaltung Schmidt & Partners',
        propertyManager: 'Thomas Schmidt',
        accountant: 'Lisa Becker',
        address: 'Berliner Straße 42, 10115 Berlin',
        unitCount: 12,
        lastModified: '2025-01-20T14:30:00.000Z',
        status: 'active',
        createdAt: '2025-01-15T09:00:00.000Z',
        updatedAt: '2025-01-20T14:30:00.000Z',
        step1Complete: true,
        step2Complete: true,
        step3Complete: true,
        currentStep: 3,
        completed: true,
        completionPercentage: 100,
        buildings: [
          {
            streetName: 'Berliner Straße',
            houseNumber: '42',
            postalCode: '10115',
            city: 'Berlin',
            buildingType: 'altbau',
            floors: 4,
            unitsPerFloor: 3,
            constructionYear: 1905,
            units: Array.from({ length: 12 }, (_, i) => ({
              unitNumber: `${Math.floor(i / 3) + 1}.${(i % 3) + 1}`,
              floor: Math.floor(i / 3),
              type: 'apartment' as const,
              rooms: [3, 4, 2][i % 3] as number,
              size: [85, 110, 65][i % 3] as number,
              ownershipShare: 8.33,
              owner: `${['Familie', 'Herr', 'Frau'][i % 3]} ${['Meyer', 'Schmidt', 'Weber', 'Wagner'][Math.floor(i / 3)]}`,
            })),
          },
        ],
      },
      {
        id: '2',
        name: 'Moderne Wohnanlage Spree',
        type: 'MV',
        propertyNumber: 'MV-2025-001',
        managementCompany: 'Immobilien Berlin GmbH',
        propertyManager: 'Sarah Johnson',
        accountant: 'Martin Fischer',
        address: 'Spreeweg 15-17, 10557 Berlin',
        unitCount: 48,
        lastModified: '2025-01-22T11:15:00.000Z',
        status: 'active',
        createdAt: '2025-01-10T10:00:00.000Z',
        updatedAt: '2025-01-22T11:15:00.000Z',
        step1Complete: true,
        step2Complete: true,
        step3Complete: true,
        currentStep: 3,
        completed: true,
        completionPercentage: 100,
        buildings: [
          {
            streetName: 'Spreeweg',
            houseNumber: '15',
            postalCode: '10557',
            city: 'Berlin',
            buildingType: 'neubau',
            floors: 6,
            unitsPerFloor: 4,
            constructionYear: 2020,
            units: Array.from({ length: 24 }, (_, i) => ({
              unitNumber: `A${Math.floor(i / 4) + 1}.${(i % 4) + 1}`,
              floor: Math.floor(i / 4),
              type: 'apartment' as const,
              rooms: [1, 2, 3, 2][i % 4] as number,
              size: [45, 65, 85, 55][i % 4] as number,
              rent: [950, 1250, 1650, 1100][i % 4],
              tenant: i % 5 === 0 ? undefined : `Mieter ${i + 1}`,
            })),
          },
          {
            streetName: 'Spreeweg',
            houseNumber: '17',
            postalCode: '10557',
            city: 'Berlin',
            buildingType: 'neubau',
            floors: 6,
            unitsPerFloor: 4,
            constructionYear: 2020,
            units: Array.from({ length: 24 }, (_, i) => ({
              unitNumber: `B${Math.floor(i / 4) + 1}.${(i % 4) + 1}`,
              floor: Math.floor(i / 4),
              type: 'apartment' as const,
              rooms: [2, 3, 1, 2][i % 4] as number,
              size: [60, 80, 40, 55][i % 4] as number,
              rent: [1150, 1450, 850, 1050][i % 4],
              tenant: i % 6 === 0 ? undefined : `Mieter ${i + 25}`,
            })),
          },
        ],
      },
      {
        id: '3',
        name: 'Charlottenburger Höfe',
        type: 'WEG',
        propertyNumber: 'WEG-2025-002',
        managementCompany: 'Premium Property Management',
        propertyManager: 'Dr. Michael Hoffmann',
        accountant: 'Christina Neumann',
        address: 'Kurfürstendamm 250, 10719 Berlin',
        unitCount: 8,
        lastModified: '2025-01-23T16:45:00.000Z',
        status: 'active',
        createdAt: '2025-01-18T12:00:00.000Z',
        updatedAt: '2025-01-23T16:45:00.000Z',
        step1Complete: true,
        step2Complete: true,
        step3Complete: true,
        currentStep: 3,
        completed: true,
        completionPercentage: 100,
        buildings: [
          {
            streetName: 'Kurfürstendamm',
            houseNumber: '250',
            postalCode: '10719',
            city: 'Berlin',
            buildingType: 'altbau',
            floors: 4,
            unitsPerFloor: 2,
            constructionYear: 1895,
            units: Array.from({ length: 8 }, (_, i) => ({
              unitNumber: `${Math.floor(i / 2) + 1}${i % 2 === 0 ? 'A' : 'B'}`,
              floor: Math.floor(i / 2),
              type: 'apartment' as const,
              rooms: i % 2 === 0 ? 5 : 4,
              size: i % 2 === 0 ? 165 : 135,
              ownershipShare: 12.5,
              owner: ['Dr. Klaus Weber', 'Maria Schulz', 'Familie Richter', 'Hans-Peter König', 
                      'Ingrid Lehmann', 'Prof. Müller', 'Familie Braun', 'Sophie Wagner'][i],
            })),
          },
        ],
      },
      {
        id: '4',
        name: 'Prenzlauer Berg Residence',
        type: 'WEG',
        propertyNumber: 'WEG-2025-003',
        managementCompany: 'Buena Property Management GmbH',
        propertyManager: 'Max Mustermann',
        accountant: 'jane-smith',
        address: '',
        unitCount: 0,
        lastModified: '2025-01-24T09:30:00.000Z',
        status: 'active',
        createdAt: '2025-01-24T09:00:00.000Z',
        updatedAt: '2025-01-24T09:30:00.000Z',
        step1Complete: true,
        step2Complete: false,
        step3Complete: false,
        currentStep: 1,
        completed: false,
        completionPercentage: 33,
        buildings: [],
      },
      {
        id: '5',
        name: 'Friedrichshain Complex',
        type: 'MV',
        propertyNumber: 'MV-2025-002',
        managementCompany: 'Buena Property Management GmbH',
        propertyManager: 'Max Mustermann',
        accountant: '',
        address: '',
        unitCount: 0,
        lastModified: '2025-01-24T08:45:00.000Z',
        status: 'active',
        createdAt: '2025-01-24T08:30:00.000Z',
        updatedAt: '2025-01-24T08:45:00.000Z',
        step1Complete: false,
        step2Complete: false,
        step3Complete: false,
        currentStep: 1,
        completed: false,
        completionPercentage: 25,
        buildings: [],
      },
    ];

    this.properties = seedProperties;
  }
}