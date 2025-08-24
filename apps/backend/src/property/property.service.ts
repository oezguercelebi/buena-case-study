import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { AutosavePropertyDto, GeneralInfoStepDto, BuildingDataStepDto, UnitsDataStepDto } from './dto/update-step.dto';
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

  // Create a new draft property
  createDraft(initialData?: Partial<AutosavePropertyDto>): Property {
    const property: Property = {
      id: Date.now().toString(),
      name: initialData?.name || '',
      type: initialData?.type || 'WEG',
      propertyNumber: initialData?.propertyNumber || '',
      managementCompany: initialData?.managementCompany || '',
      propertyManager: initialData?.propertyManager || '',
      accountant: initialData?.accountant || '',
      address: initialData?.address || '',
      buildings: (initialData?.buildings as any[]) || [],
      unitCount: 0,
      lastModified: new Date().toISOString(),
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      step1Complete: initialData?.step1Complete || false,
      step2Complete: initialData?.step2Complete || false,
      step3Complete: initialData?.step3Complete || false,
      currentStep: initialData?.currentStep || 1,
    };
    
    this.properties.push(property);
    return property;
  }

  // Autosave functionality - updates a draft with partial data
  autosave(id: string, data: AutosavePropertyDto): Property {
    const index = this.properties.findIndex(property => property.id === id);
    if (index === -1) {
      throw new NotFoundException(`Property with id ${id} not found`);
    }

    const property = this.properties[index];

    // Only allow autosave on draft properties
    if (property.status !== 'draft') {
      throw new Error('Can only autosave draft properties');
    }

    // Calculate unit count if buildings are updated
    let unitCount = property.unitCount;
    if (data.buildings) {
      unitCount = data.buildings.reduce((sum, building) => {
        return sum + (building.units?.length || 0);
      }, 0);
    }

    // Update the property with new data
    this.properties[index] = {
      ...property,
      ...(data as any),
      unitCount,
      lastModified: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.properties[index];
  }

  // Update specific step data
  updateStep(id: string, step: number, data: GeneralInfoStepDto | BuildingDataStepDto | UnitsDataStepDto): Property {
    const property = this.findOne(id);
    if (!property) {
      throw new NotFoundException(`Property with id ${id} not found`);
    }

    if (property.status !== 'draft') {
      throw new Error('Can only update steps on draft properties');
    }

    let updateData: Partial<Property> = {
      currentStep: step,
      lastModified: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    switch (step) {
      case 1:
        const generalInfo = data as GeneralInfoStepDto;
        updateData = {
          ...updateData,
          ...generalInfo,
          step1Complete: this.isStep1Complete(generalInfo),
        };
        break;
      case 2:
        const buildingData = data as BuildingDataStepDto;
        updateData = {
          ...updateData,
          buildings: (buildingData.buildings as any) || property.buildings,
          step2Complete: this.isStep2Complete(buildingData),
        };
        break;
      case 3:
        const unitsData = data as UnitsDataStepDto;
        const unitCount = unitsData.buildings?.reduce((sum, building) => {
          return sum + (building.units?.length || 0);
        }, 0) || property.unitCount;
        updateData = {
          ...updateData,
          buildings: (unitsData.buildings as any) || property.buildings,
          unitCount,
          step3Complete: this.isStep3Complete(unitsData, property.type),
        };
        break;
      default:
        throw new Error(`Invalid step number: ${step}`);
    }

    return this.autosave(id, updateData);
  }

  // Finalize a draft property (convert to active)
  finalizeDraft(id: string): Property {
    const property = this.findOne(id);
    if (!property) {
      throw new NotFoundException(`Property with id ${id} not found`);
    }

    if (property.status !== 'draft') {
      throw new Error('Can only finalize draft properties');
    }

    // Validate that all required steps are complete
    if (!this.isDraftComplete(property)) {
      throw new Error('Cannot finalize incomplete draft. All steps must be completed.');
    }

    const index = this.properties.findIndex(p => p.id === id);
    this.properties[index] = {
      ...property,
      status: 'active',
      lastModified: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.properties[index];
  }

  // Helper methods for step completion validation
  private isStep1Complete(data: GeneralInfoStepDto): boolean {
    return !!(data.name && data.type && data.address);
  }

  private isStep2Complete(data: BuildingDataStepDto): boolean {
    if (!data.buildings || data.buildings.length === 0) return false;
    return data.buildings.every(building => 
      building.streetName && 
      building.houseNumber && 
      building.postalCode && 
      building.city && 
      building.buildingType &&
      building.floors && 
      building.unitsPerFloor
    );
  }

  private isStep3Complete(data: UnitsDataStepDto, propertyType: 'WEG' | 'MV'): boolean {
    if (!data.buildings || data.buildings.length === 0) return false;
    
    return data.buildings.every(building => {
      if (!building.units || building.units.length === 0) return false;
      
      return building.units.every(unit => {
        const basicComplete = unit.unitNumber && 
                            unit.type && 
                            unit.rooms && 
                            unit.size;
        
        if (propertyType === 'WEG') {
          return basicComplete && unit.ownershipShare !== undefined;
        } else {
          return basicComplete && unit.rent !== undefined;
        }
      });
    });
  }

  private isDraftComplete(property: Property): boolean {
    return !!(property.step1Complete && property.step2Complete && property.step3Complete);
  }

  // Get all draft properties
  getDrafts(): Property[] {
    return this.properties.filter(property => property.status === 'draft');
  }

  // Delete a draft property
  deleteDraft(id: string): boolean {
    const index = this.properties.findIndex(property => property.id === id && property.status === 'draft');
    if (index === -1) {
      return false;
    }
    this.properties.splice(index, 1);
    return true;
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
        step1Complete: true,
        step2Complete: true,
        step3Complete: true,
        currentStep: 3,
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
        step1Complete: true,
        step2Complete: true,
        step3Complete: true,
        currentStep: 3,
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
        step1Complete: true,
        step2Complete: true,
        step3Complete: false,
        currentStep: 3,
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