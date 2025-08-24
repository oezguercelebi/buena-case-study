import { PropertyType, BuildingType, UnitType } from '../dto/create-property.dto';

export interface Unit {
  unitNumber: string;
  floor: number;
  type: UnitType;
  rooms: number;
  size: number;
  ownershipShare?: number;
  owner?: string;
  rent?: number;
  tenant?: string;
}

export interface Building {
  streetName: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  buildingType: BuildingType;
  floors: number;
  unitsPerFloor: number;
  constructionYear?: number;
  units: Unit[];
}

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  propertyNumber: string;
  managementCompany?: string;
  propertyManager?: string;
  accountant?: string;
  address: string;
  buildings: Building[];
  unitCount: number;
  lastModified: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
  
  // Step completion tracking for onboarding flow
  step1Complete?: boolean;
  step2Complete?: boolean;
  step3Complete?: boolean;
  currentStep?: number;
  
  // Overall completion tracking
  completed?: boolean;
  completionPercentage?: number;
}