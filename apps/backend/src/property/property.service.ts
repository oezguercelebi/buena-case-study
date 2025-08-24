import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePropertyDto, PropertyType, BuildingType, UnitType } from './dto/create-property.dto';
import { AutosavePropertyDto, GeneralInfoStepDto, BuildingDataStepDto, UnitsDataStepDto, PartialBuildingDto } from './dto/update-step.dto';
import { Property, Building, Unit } from './interfaces/property.interface';

export type { Property };

@Injectable()
export class PropertyService {
  private properties: Property[] = [];

  // Helper method to convert partial buildings to complete buildings
  private convertPartialBuildingsToComplete(partialBuildings: PartialBuildingDto[]): Building[] {
    return partialBuildings.map(partial => ({
      streetName: partial.streetName || '',
      houseNumber: partial.houseNumber || '',
      postalCode: partial.postalCode || '',
      city: partial.city || '',
      buildingType: partial.buildingType || 'altbau',
      floors: partial.floors || 1,
      unitsPerFloor: partial.unitsPerFloor || 1,
      constructionYear: partial.constructionYear,
      units: partial.units?.map(unit => ({
        unitNumber: unit.unitNumber || '',
        floor: unit.floor || 0,
        type: unit.type || 'apartment',
        rooms: unit.rooms || 1,
        size: unit.size || 50,
        ownershipShare: unit.ownershipShare,
        owner: unit.owner,
        rent: unit.rent,
        tenant: unit.tenant,
      })) || [],
    }));
  }

  constructor() {
    // Initialize with seed data
    this.initializeSeedData();
  }

  findAll(): Property[] {
    return this.properties;
  }

  create(createPropertyDto: CreatePropertyDto): Property {
    const totalUnits = (createPropertyDto.buildings || []).reduce(
      (sum, building) => sum + (building.units?.length || 0),
      0
    );

    let property: Property = {
      id: Date.now().toString(),
      name: createPropertyDto.name,
      type: createPropertyDto.type,
      propertyNumber: createPropertyDto.propertyNumber,
      managementCompany: createPropertyDto.managementCompany,
      propertyManager: createPropertyDto.propertyManager,
      accountant: createPropertyDto.accountant,
      address: createPropertyDto.address,
      buildings: createPropertyDto.buildings || [],
      unitCount: totalUnits,
      lastModified: new Date().toISOString(),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Update progress tracking
    property = this.updateProgressTracking(property);
    this.properties.push(property);
    return property;
  }

  findOne(id: string): Property | undefined {
    return this.properties.find(property => property.id === id);
  }

  getStats(): {
    totalProperties: number;
    wegProperties: number;
    mvProperties: number;
    totalUnits: number;
    activeProperties: number;
    archivedProperties: number;
    averageUnitsPerProperty: number;
    completedProperties: number;
    inProgressProperties: number;
    notStartedProperties: number;
    averageCompletionPercentage: number;
  } {
    const totalProperties = this.properties.length;
    const wegProperties = this.properties.filter(p => p.type === 'WEG').length;
    const mvProperties = this.properties.filter(p => p.type === 'MV').length;
    const totalUnits = this.properties.reduce((sum, p) => sum + p.unitCount, 0);
    const activeProperties = this.properties.filter(p => p.status === 'active').length;
    const archivedProperties = this.properties.filter(p => p.status === 'archived').length;
    
    // Progress statistics
    const completedProperties = this.properties.filter(p => p.completed === true).length;
    const inProgressProperties = this.properties.filter(p => p.completionPercentage && p.completionPercentage > 0 && p.completionPercentage < 100).length;
    const notStartedProperties = this.properties.filter(p => !p.completionPercentage || p.completionPercentage === 0).length;
    const averageCompletionPercentage = totalProperties > 0 
      ? Math.round(this.properties.reduce((sum, p) => sum + (p.completionPercentage || 0), 0) / totalProperties)
      : 0;
    
    return {
      totalProperties,
      wegProperties,
      mvProperties,
      totalUnits,
      activeProperties,
      archivedProperties,
      averageUnitsPerProperty: totalProperties > 0 ? Math.round(totalUnits / totalProperties) : 0,
      completedProperties,
      inProgressProperties,
      notStartedProperties,
      averageCompletionPercentage,
    };
  }

  update(id: string, updatePropertyDto: Partial<CreatePropertyDto>): Property | null {
    const index = this.properties.findIndex(property => property.id === id);
    if (index === -1) {
      return null;
    }

    const existingProperty = this.properties[index];
    if (!existingProperty) {
      return null;
    }

    const totalUnits = updatePropertyDto.buildings?.reduce(
      (sum, building) => sum + building.units.length,
      0
    ) || existingProperty.unitCount;

    let updatedProperty: Property = {
      ...existingProperty,
      name: updatePropertyDto.name || existingProperty.name,
      type: updatePropertyDto.type || existingProperty.type,
      propertyNumber: updatePropertyDto.propertyNumber || existingProperty.propertyNumber,
      managementCompany: updatePropertyDto.managementCompany || existingProperty.managementCompany,
      propertyManager: updatePropertyDto.propertyManager || existingProperty.propertyManager,
      accountant: updatePropertyDto.accountant || existingProperty.accountant,
      address: updatePropertyDto.address || existingProperty.address,
      buildings: updatePropertyDto.buildings || existingProperty.buildings,
      unitCount: totalUnits,
      lastModified: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Update progress tracking
    updatedProperty = this.updateProgressTracking(updatedProperty);
    this.properties[index] = updatedProperty;
    return this.properties[index];
  }

  // Create a new property with initial data
  createPropertyWithData(initialData?: Partial<AutosavePropertyDto>): Property {
    let property: Property = {
      id: Date.now().toString(),
      name: initialData?.name || '',
      type: initialData?.type || 'WEG',
      propertyNumber: initialData?.propertyNumber || '',
      managementCompany: initialData?.managementCompany || '',
      propertyManager: initialData?.propertyManager || '',
      accountant: initialData?.accountant || '',
      address: initialData?.address || '',
      buildings: initialData?.buildings ? this.convertPartialBuildingsToComplete(initialData.buildings) : [],
      unitCount: 0,
      lastModified: new Date().toISOString(),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      step1Complete: initialData?.step1Complete || false,
      step2Complete: initialData?.step2Complete || false,
      step3Complete: initialData?.step3Complete || false,
      currentStep: initialData?.currentStep || 1,
    };
    
    // Update progress tracking
    property = this.updateProgressTracking(property);
    this.properties.push(property);
    return property;
  }

  // Autosave functionality - updates property with partial data
  autosave(id: string, data: AutosavePropertyDto): Property {
    const index = this.properties.findIndex(property => property.id === id);
    if (index === -1) {
      throw new NotFoundException(`Property with id ${id} not found`);
    }

    const property = this.properties[index];
    if (!property) {
      throw new NotFoundException(`Property with id ${id} not found`);
    }

    // Calculate unit count if buildings are updated
    let unitCount = property.unitCount;
    if (data.buildings) {
      unitCount = data.buildings.reduce((sum, building) => {
        return sum + (building.units?.length || 0);
      }, 0);
    }

    // Update the property with new data
    let updatedProperty: Property = {
      ...property,
      unitCount,
      lastModified: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update individual fields from data
    if (data.name !== undefined) updatedProperty.name = data.name;
    if (data.type !== undefined) updatedProperty.type = data.type;
    if (data.propertyNumber !== undefined) updatedProperty.propertyNumber = data.propertyNumber;
    if (data.managementCompany !== undefined) updatedProperty.managementCompany = data.managementCompany;
    if (data.propertyManager !== undefined) updatedProperty.propertyManager = data.propertyManager;
    if (data.accountant !== undefined) updatedProperty.accountant = data.accountant;
    if (data.address !== undefined) updatedProperty.address = data.address;
    if (data.buildings !== undefined) updatedProperty.buildings = this.convertPartialBuildingsToComplete(data.buildings);
    if (data.step1Complete !== undefined) updatedProperty.step1Complete = data.step1Complete;
    if (data.step2Complete !== undefined) updatedProperty.step2Complete = data.step2Complete;
    if (data.step3Complete !== undefined) updatedProperty.step3Complete = data.step3Complete;
    if (data.currentStep !== undefined) updatedProperty.currentStep = data.currentStep;

    // Update progress tracking
    updatedProperty = this.updateProgressTracking(updatedProperty);
    this.properties[index] = updatedProperty;

    return this.properties[index];
  }

  // Update specific step data
  updateStep(id: string, step: number, data: GeneralInfoStepDto | BuildingDataStepDto | UnitsDataStepDto): Property {
    const property = this.findOne(id);
    if (!property) {
      throw new NotFoundException(`Property with id ${id} not found`);
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
          buildings: buildingData.buildings ? this.convertPartialBuildingsToComplete(buildingData.buildings) : property.buildings,
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
          buildings: unitsData.buildings ? this.convertPartialBuildingsToComplete(unitsData.buildings) : property.buildings,
          unitCount,
          step3Complete: this.isStep3Complete(unitsData, property.type),
        };
        break;
      default:
        throw new Error(`Invalid step number: ${step}`);
    }

    return this.autosave(id, updateData);
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

  // Progress tracking methods
  private calculateCompletionPercentage(property: Property): number {
    let completedSections = 0;
    const totalSections = 3;

    // Section 1: General Information (33%)
    if (property.name && property.type && property.address) {
      completedSections++;
    }

    // Section 2: Buildings (33%) 
    if (property.buildings && property.buildings.length > 0) {
      const allBuildingsComplete = property.buildings.every(building => 
        building.streetName && 
        building.houseNumber && 
        building.postalCode && 
        building.city && 
        building.buildingType &&
        building.floors && 
        building.unitsPerFloor
      );
      if (allBuildingsComplete) {
        completedSections++;
      }
    }

    // Section 3: Units (34%)
    if (property.buildings && property.buildings.length > 0) {
      const allUnitsComplete = property.buildings.every(building => {
        if (!building.units || building.units.length === 0) return false;
        
        return building.units.every(unit => {
          const basicComplete = unit.unitNumber && 
                              unit.type && 
                              unit.rooms && 
                              unit.size;
          
          if (property.type === 'WEG') {
            return basicComplete && unit.ownershipShare !== undefined;
          } else {
            return basicComplete && unit.rent !== undefined;
          }
        });
      });
      if (allUnitsComplete) {
        completedSections++;
      }
    }

    return Math.round((completedSections / totalSections) * 100);
  }

  private updateProgressTracking(property: Property): Property {
    const completionPercentage = this.calculateCompletionPercentage(property);
    const completed = completionPercentage === 100;

    return {
      ...property,
      completionPercentage,
      completed,
    };
  }

  // Delete a property
  deleteProperty(id: string): boolean {
    const index = this.properties.findIndex(property => property.id === id);
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
              type: 'apartment' as UnitType,
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
              type: 'apartment' as UnitType,
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
              type: 'apartment' as UnitType,
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
              type: 'apartment' as UnitType,
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