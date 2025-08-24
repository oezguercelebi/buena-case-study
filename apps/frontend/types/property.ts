export type PropertyType = 'WEG' | 'MV'
export type BuildingType = 'altbau' | 'neubau' | 'hochhaus' | 'mixed'
export type UnitType = 'apartment' | 'office' | 'parking' | 'storage' | 'commercial'
export type ShareDistributionMethod = 'equal' | 'size' | 'rooms' | 'custom'
export type PropertyStatus = 'active' | 'archived'

// Onboarding specific interfaces
export interface OnboardingPropertyData {
  // Step 1: General Information
  name?: string
  type?: PropertyType
  propertyNumber?: string
  address?: string
  managementCompany?: string
  propertyManager?: string
  accountant?: string
  uploadedDocument?: File
  aiExtractionEnabled?: boolean
  
  // Step 2: Building Data
  buildings?: OnboardingBuildingData[]
  
  // Step 3: Units
  shareDistributionMethod?: ShareDistributionMethod
  
  // Metadata
  currentStep?: number
  completedSteps?: number[]
  lastModified?: Date
}

export interface OnboardingBuildingData {
  id?: string
  address?: string
  streetName?: string
  houseNumber?: string
  postalCode?: string
  city?: string
  buildingType?: BuildingType
  floors?: number
  unitsPerFloor?: number
  constructionYear?: number
  units?: OnboardingUnitData[]
  totalArea?: number
}

export interface OnboardingUnitData {
  id?: string
  unitNumber?: string
  floor?: number
  type?: UnitType
  rooms?: number
  size?: number // in m²
  // WEG specific
  ownershipShare?: number // as decimal (e.g., 0.05 for 5%)
  owner?: string
  // MV specific
  currentRent?: number // monthly rent in EUR
  rent?: number // legacy field for compatibility
  tenant?: string
  leaseStartDate?: string
  leaseEndDate?: string
  isOccupied?: boolean
}

// Production interfaces (for API/backend)
export interface Property {
  id: string
  name: string
  type: PropertyType
  propertyNumber: string
  managementCompany?: string
  propertyManager?: string
  accountant?: string
  status: PropertyStatus
  buildings: Building[]
  metadata?: Record<string, any>
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
  ownershipShare?: number // as decimal
  owner?: string
  // MV specific
  rent?: number // monthly rent in EUR
  tenant?: string
  leaseStartDate?: Date
  leaseEndDate?: Date
  isOccupied?: boolean
  features?: Record<string, any>
}

// Utility types for step components
export interface OnboardingStepProps {
  data: OnboardingPropertyData
  updateData: (updates: Partial<OnboardingPropertyData>) => void
  onNext?: () => void
  onPrevious?: () => void
}

// Local storage keys
export const STORAGE_KEYS = {
  ONBOARDING_DATA: 'buena_onboarding_data',
  ONBOARDING_STEP: 'buena_onboarding_current_step',
  LAST_SAVED: 'buena_onboarding_last_saved',
} as const

// Validation constants
export const VALIDATION_RULES = {
  PROPERTY_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
  },
  UNIT_SIZE: {
    MIN: 15,
    MAX: 500,
  },
  FLOORS: {
    MIN: 1,
    MAX: 50,
  },
  OWNERSHIP_SHARE_TOTAL: 100.000, // For WEG properties
} as const