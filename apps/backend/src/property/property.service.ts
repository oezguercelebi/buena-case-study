import { Injectable } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { Property } from './interfaces/property.interface';

export type { Property };

@Injectable()
export class PropertyService {
  private properties: Property[] = [];

  constructor() {
    // Initialize with seed data
    this.initializeSeedData();
  }

  findAll() {
    return this.properties;
  }

  create(createPropertyDto: CreatePropertyDto) {
    const totalUnits = createPropertyDto.buildings.reduce(
      (sum, building) => sum + building.units.length,
      0
    );

    const property: Property = {
      id: Date.now().toString(),
      ...createPropertyDto,
      unitCount: totalUnits,
      lastModified: new Date().toISOString(),
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.properties.push(property);
    return property;
  }

  findOne(id: string) {
    return this.properties.find(property => property.id === id);
  }

  getStats() {
    const totalProperties = this.properties.length;
    const wegProperties = this.properties.filter(p => p.type === 'WEG').length;
    const mvProperties = this.properties.filter(p => p.type === 'MV').length;
    const totalUnits = this.properties.reduce((sum, p) => sum + p.unitCount, 0);
    const activeProperties = this.properties.filter(p => p.status === 'active').length;
    const draftProperties = this.properties.filter(p => p.status === 'draft').length;
    
    return {
      totalProperties,
      wegProperties,
      mvProperties,
      totalUnits,
      activeProperties,
      draftProperties,
      averageUnitsPerProperty: totalProperties > 0 ? Math.round(totalUnits / totalProperties) : 0,
    };
  }

  update(id: string, updatePropertyDto: Partial<CreatePropertyDto>) {
    const index = this.properties.findIndex(property => property.id === id);
    if (index === -1) {
      return null;
    }

    const totalUnits = updatePropertyDto.buildings?.reduce(
      (sum, building) => sum + building.units.length,
      0
    ) || this.properties[index].unitCount;

    this.properties[index] = {
      ...this.properties[index],
      ...updatePropertyDto,
      unitCount: totalUnits,
      lastModified: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.properties[index];
  }

  private initializeSeedData() {
    const seedProperties: Property[] = [
      {
        id: '1',
        name: 'Friedrichstraße 123 WEG',
        type: 'WEG',
        propertyNumber: 'WEG-2024-001',
        managementCompany: 'Berlin Property Management GmbH',
        propertyManager: 'Max Mustermann',
        accountant: 'Anna Schmidt',
        address: 'Friedrichstraße 123, 10117 Berlin',
        unitCount: 24,
        lastModified: '2024-01-15T10:00:00.000Z',
        status: 'active',
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-15T10:00:00.000Z',
        buildings: [
          {
            streetName: 'Friedrichstraße',
            houseNumber: '123',
            postalCode: '10117',
            city: 'Berlin',
            buildingType: 'altbau',
            floors: 6,
            unitsPerFloor: 4,
            constructionYear: 1910,
            units: Array.from({ length: 24 }, (_, i) => ({
              unitNumber: `${Math.floor(i / 4) + 1}${String.fromCharCode(65 + (i % 4))}`,
              floor: Math.floor(i / 4),
              type: 'apartment' as const,
              rooms: i % 3 === 0 ? 2 : i % 3 === 1 ? 3 : 4,
              size: 65 + Math.floor(i / 4) * 5 + (i % 4) * 10,
              ownershipShare: 100 / 24,
              owner: `Owner ${i + 1}`,
            })),
          },
        ],
      },
      {
        id: '2',
        name: 'Potsdamer Platz 45',
        type: 'MV',
        propertyNumber: 'MV-2024-002',
        managementCompany: 'Modern Living Properties',
        propertyManager: 'Julia Weber',
        accountant: 'Thomas Klein',
        address: 'Potsdamer Platz 45, 10785 Berlin',
        unitCount: 60,
        lastModified: '2024-01-14T10:00:00.000Z',
        status: 'active',
        createdAt: '2024-01-02T10:00:00.000Z',
        updatedAt: '2024-01-14T10:00:00.000Z',
        buildings: [
          {
            streetName: 'Potsdamer Platz',
            houseNumber: '45',
            postalCode: '10785',
            city: 'Berlin',
            buildingType: 'neubau',
            floors: 10,
            unitsPerFloor: 6,
            constructionYear: 2018,
            units: Array.from({ length: 60 }, (_, i) => ({
              unitNumber: `${Math.floor(i / 6) + 1}${String.fromCharCode(65 + (i % 6))}`,
              floor: Math.floor(i / 6),
              type: 'apartment' as const,
              rooms: i % 4 === 0 ? 1 : i % 4 === 1 ? 2 : i % 4 === 2 ? 3 : 4,
              size: 45 + (i % 4) * 25,
              rent: 800 + (i % 4) * 400 + Math.floor(i / 6) * 50,
              tenant: i % 3 === 0 ? undefined : `Tenant ${i + 1}`,
            })),
          },
        ],
      },
      {
        id: '3',
        name: 'Alexanderplatz 78 WEG',
        type: 'WEG',
        propertyNumber: 'WEG-2024-003',
        managementCompany: 'City Center Management',
        propertyManager: 'Stefan Müller',
        accountant: 'Maria Fischer',
        address: 'Alexanderplatz 78, 10178 Berlin',
        unitCount: 36,
        lastModified: '2024-01-10T10:00:00.000Z',
        status: 'draft',
        createdAt: '2024-01-05T10:00:00.000Z',
        updatedAt: '2024-01-10T10:00:00.000Z',
        buildings: [
          {
            streetName: 'Alexanderplatz',
            houseNumber: '78',
            postalCode: '10178',
            city: 'Berlin',
            buildingType: 'mixed',
            floors: 9,
            unitsPerFloor: 4,
            constructionYear: 1975,
            units: Array.from({ length: 36 }, (_, i) => ({
              unitNumber: `${Math.floor(i / 4) + 1}${String.fromCharCode(65 + (i % 4))}`,
              floor: Math.floor(i / 4),
              type: i < 4 ? 'commercial' as const : 'apartment' as const,
              rooms: i < 4 ? 1 : i % 3 === 0 ? 2 : i % 3 === 1 ? 3 : 4,
              size: i < 4 ? 120 : 70 + (i % 3) * 15,
              ownershipShare: 100 / 36,
              owner: `Owner ${i + 1}`,
            })),
          },
        ],
      },
    ];

    this.properties = seedProperties;
  }
}