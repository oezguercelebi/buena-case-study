export type PropertyType = 'WEG' | 'MV'
export type BuildingType = 'altbau' | 'neubau' | 'hochhaus' | 'mixed'
export type UnitType = 'apartment' | 'office' | 'parking' | 'storage' | 'commercial'
export type ShareDistributionMethod = 'equal' | 'size' | 'rooms' | 'custom'

export interface Property {
  id: string
  name: string
  type: PropertyType
  propertyNumber?: string
  managementCompany?: string
  propertyManager?: string
  accountant?: string
  address: string
  buildings: Building[]
  createdAt: Date
  updatedAt: Date
}

export interface Building {
  id: string
  propertyId: string
  streetName: string
  houseNumber: string
  postalCode: string
  city: string
  buildingType: BuildingType
  floors: number
  unitsPerFloor: number
  constructionYear?: number
  units: Unit[]
  totalArea?: number
}

export interface Unit {
  id: string
  buildingId: string
  unitNumber: string
  floor: number
  type: UnitType
  rooms: number
  size: number // in m²
  // WEG specific
  ownershipShare?: number // percentage
  owner?: string
  // MV specific
  rent?: number // monthly rent in EUR
  tenant?: string
  leaseStartDate?: Date
  leaseEndDate?: Date
}