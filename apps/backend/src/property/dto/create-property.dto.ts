export class CreatePropertyDto {
  name: string;
  type: 'WEG' | 'MV';
  propertyNumber: string;
  managementCompany?: string;
  propertyManager?: string;
  accountant?: string;
  address: string;
  buildings: {
    streetName: string;
    houseNumber: string;
    postalCode: string;
    city: string;
    buildingType: 'altbau' | 'neubau' | 'hochhaus' | 'mixed';
    floors: number;
    unitsPerFloor: number;
    constructionYear?: number;
    units: {
      unitNumber: string;
      floor: number;
      type: 'apartment' | 'office' | 'parking' | 'storage' | 'commercial';
      rooms: number;
      size: number;
      ownershipShare?: number;
      owner?: string;
      rent?: number;
      tenant?: string;
    }[];
  }[];
}