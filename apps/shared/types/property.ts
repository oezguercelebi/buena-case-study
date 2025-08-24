// Shared type definitions for both frontend and backend
// This ensures type consistency across the entire application

// Base enums
export type PropertyType = 'WEG' | 'MV'
export type BuildingType = 'altbau' | 'neubau' | 'hochhaus' | 'mixed'
export type UnitType = 'apartment' | 'office' | 'parking' | 'storage' | 'commercial'
export type PropertyStatus = 'active' | 'archived'

// Validation constants - shared across frontend and backend
export const VALIDATION_RULES = {
  PROPERTY_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 200,
  },
  PROPERTY_NUMBER: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50,
  },
  UNIT_NUMBER: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 10,
  },
  UNIT_SIZE: {
    MIN: 1,
    MAX: 10000,
  },
  UNIT_ROOMS: {
    MIN: 0,
    MAX: 20,
  },
  UNIT_FLOOR: {
    MIN: 0,
    MAX: 100,
  },
  OWNERSHIP_SHARE: {
    MIN: 0.01,
    MAX: 100,
    TOTAL: 100,
    TOLERANCE: 0.1, // Allow 0.1% tolerance for rounding
  },
  RENT: {
    MIN: 0,
    MAX: 100000,
  },
  BUILDING: {
    FLOORS_MIN: 1,
    FLOORS_MAX: 200,
    UNITS_PER_FLOOR_MIN: 1,
    UNITS_PER_FLOOR_MAX: 50,
    CONSTRUCTION_YEAR_MIN: 1800,
    CONSTRUCTION_YEAR_MAX: 2030,
  },
  ADDRESS: {
    STREET_NAME_MIN: 1,
    STREET_NAME_MAX: 100,
    HOUSE_NUMBER_MIN: 1,
    HOUSE_NUMBER_MAX: 20,
    POSTAL_CODE_MIN: 4,
    POSTAL_CODE_MAX: 10,
    CITY_MIN: 1,
    CITY_MAX: 100,
    ADDRESS_MIN: 5,
    ADDRESS_MAX: 500,
  },
  NAMES: {
    MANAGEMENT_COMPANY_MAX: 200,
    PROPERTY_MANAGER_MAX: 100,
    ACCOUNTANT_MAX: 100,
    OWNER_MAX: 100,
    TENANT_MAX: 100,
  },
} as const

// Core data structures
export interface BaseUnit {
  id: string
  unitNumber: string
  floor: number
  type: UnitType
  rooms: number
  size: number // in m²
  
  // WEG specific fields
  ownershipShare?: number // as percentage (e.g., 8.33 for 8.33%)
  owner?: string
  
  // MV specific fields
  rent?: number // monthly rent in EUR
  tenant?: string
  leaseStartDate?: Date | string
  leaseEndDate?: Date | string
  isOccupied?: boolean
  
  // Optional metadata
  features?: Record<string, unknown>
}

export interface BaseBuilding {
  id: string
  streetName: string
  houseNumber: string
  postalCode: string
  city: string
  buildingType: BuildingType
  floors: number
  constructionYear?: number
  units: BaseUnit[]
  totalArea?: number
}

export interface BaseProperty {
  id: string
  name: string
  type: PropertyType
  propertyNumber: string
  managementCompany?: string
  propertyManager?: string
  accountant?: string
  address: string
  buildings: BaseBuilding[]
  status: PropertyStatus
  
  // Timestamps
  createdAt: Date | string
  updatedAt: Date | string
  lastModified: Date | string
  
  // Progress tracking
  currentStep?: number
  step1Complete?: boolean
  step2Complete?: boolean
  step3Complete?: boolean
  completed?: boolean
  completionPercentage?: number
  
  // Computed fields
  unitCount: number
  
  // Optional metadata
  metadata?: Record<string, unknown>
}

// Onboarding-specific interfaces (for frontend)
export interface OnboardingUnitData extends Omit<BaseUnit, 'id'> {
  id?: string // Optional during onboarding
  buildingId?: string
  currentRent?: number // Legacy field for compatibility
}

export interface OnboardingBuildingData extends Omit<BaseBuilding, 'id' | 'units'> {
  id?: string // Optional during onboarding
  propertyId?: string
  units?: OnboardingUnitData[]
  startingFloor?: number // Additional field for onboarding UI
  unitsPerFloor?: number // For quick generation
}

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
  
  // Step 3: Units Configuration
  shareDistributionMethod?: 'equal' | 'size' | 'rooms' | 'custom'
  
  // Metadata
  currentStep?: number
  completedSteps?: number[]
  lastModified?: Date
}

// API DTOs (for data transfer)
export interface CreatePropertyDto {
  name: string
  type: PropertyType
  propertyNumber: string
  managementCompany?: string
  propertyManager?: string
  accountant?: string
  address: string
  buildings: CreateBuildingDto[]
}

export interface CreateBuildingDto {
  streetName: string
  houseNumber: string
  postalCode: string
  city: string
  buildingType: BuildingType
  floors: number
  unitsPerFloor: number
  constructionYear?: number
  units: CreateUnitDto[]
}

export interface CreateUnitDto {
  unitNumber: string
  floor: number
  type: UnitType
  rooms: number
  size: number
  ownershipShare?: number
  owner?: string
  rent?: number
  tenant?: string
}

// Update DTOs
export interface UpdatePropertyDto extends Partial<CreatePropertyDto> {
  currentStep?: number
  step1Complete?: boolean
  step2Complete?: boolean
  step3Complete?: boolean
  completed?: boolean
}

export interface UpdateStepDto {
  currentStep: number
  data: Partial<OnboardingPropertyData>
  isCompleting?: boolean
}

// API Response types
export interface PropertyResponse extends BaseProperty {
  buildings: BuildingResponse[]
}

export interface BuildingResponse extends BaseBuilding {
  propertyId: string
  units: UnitResponse[]
}

export interface UnitResponse extends BaseUnit {
  buildingId: string
}

// Validation interfaces
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface StepValidation extends ValidationResult {
  completedFields: number
  totalFields: number
  completionPercentage: number
}

export interface PropertyValidation {
  property: ValidationResult
  buildings: ValidationResult
  units: ValidationResult
  overall: StepValidation
}

// Error handling
export interface ValidationError {
  field: string
  message: string
  code?: string
  value?: unknown
}

export interface ApiError {
  message: string
  statusCode: number
  error?: string
  details?: ValidationError[]
  timestamp?: string
  path?: string
}

// Utility types
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>

// Form-specific types
export interface PropertyFormData extends OnboardingPropertyData {
  hasValidUnits?: boolean
}

export interface BuildingFormData extends OnboardingBuildingData {
  hasValidUnits: boolean
  unitCount: number
}

export interface UnitFormData extends OnboardingUnitData {
  buildingId: string
}

// Performance optimization types
export interface VirtualScrollOptions {
  itemHeight: number
  containerHeight: number
  bufferSize?: number
  overscan?: number
}

export interface VirtualScrollItem<T = unknown> {
  index: number
  height: number
  offset: number
  data: T
}

// Local storage keys
export const STORAGE_KEYS = {
  ONBOARDING_DATA: 'buena_onboarding_data',
  ONBOARDING_STEP: 'buena_onboarding_current_step',
  LAST_SAVED: 'buena_onboarding_last_saved',
  PROPERTY_ID: 'buena_onboarding_property_id',
  THEME_PREFERENCE: 'buena_theme_preference',
  USER_PREFERENCES: 'buena_user_preferences',
} as const

// API endpoints (for consistency)
export const API_ENDPOINTS = {
  PROPERTIES: '/property',
  PROPERTY_BY_ID: (id: string) => `/property/${id}`,
  PROPERTY_AUTOSAVE: (id: string) => `/property/${id}/autosave`,
  VALIDATE_PROPERTY: '/property/validate',
  BUILDINGS: '/buildings',
  UNITS: '/units',
} as const

// Event types for real-time updates
export type PropertyEvent = 
  | { type: 'property.created'; payload: PropertyResponse }
  | { type: 'property.updated'; payload: PropertyResponse }
  | { type: 'property.deleted'; payload: { id: string } }
  | { type: 'step.completed'; payload: { propertyId: string; step: number } }
  | { type: 'autosave.success'; payload: { propertyId: string; timestamp: string } }
  | { type: 'autosave.failed'; payload: { propertyId: string; error: string } }

// Helper type guards
export const isWEGProperty = (property: Pick<BaseProperty, 'type'>): boolean => {
  return property.type === 'WEG'
}

export const isMVProperty = (property: Pick<BaseProperty, 'type'>): boolean => {
  return property.type === 'MV'
}

export const hasUnits = (building: Pick<BaseBuilding, 'units'>): boolean => {
  return building.units.length > 0
}

export const isUnitValid = (unit: BaseUnit, propertyType: PropertyType): boolean => {
  const hasRequiredFields = !!(unit.unitNumber && unit.type && unit.rooms > 0 && unit.size > 0)

  if (propertyType === 'WEG') {
    return hasRequiredFields && typeof unit.ownershipShare === 'number' && unit.ownershipShare > 0
  }
  
  if (propertyType === 'MV') {
    return hasRequiredFields && typeof unit.rent === 'number' && unit.rent >= 0
  }
  
  return hasRequiredFields
}

// Constants for UI
export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  WEG: 'Wohnungseigentümergemeinschaft (WEG)',
  MV: 'Mietverwaltung (MV)'
}

export const BUILDING_TYPE_LABELS: Record<BuildingType, string> = {
  altbau: 'Altbau',
  neubau: 'Neubau', 
  hochhaus: 'Hochhaus',
  mixed: 'Mixed Use'
}

export const UNIT_TYPE_LABELS: Record<UnitType, string> = {
  apartment: 'Apartment',
  office: 'Office',
  parking: 'Parking',
  storage: 'Storage',
  commercial: 'Commercial'
}