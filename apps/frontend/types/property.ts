// Shared types (simplified for frontend usage)
export type PropertyType = 'WEG' | 'MV'
export type BuildingType = 'altbau' | 'neubau' | 'hochhaus' | 'mixed'
export type UnitType = 'apartment' | 'office' | 'parking' | 'storage' | 'commercial'
export type PropertyStatus = 'active' | 'archived'

// Additional frontend-specific types (if needed)
export type ShareDistributionMethod = 'equal' | 'size' | 'rooms' | 'custom'

// Core onboarding interfaces
export interface OnboardingUnitData {
  id?: string
  unitNumber?: string
  floor?: number
  type?: UnitType
  rooms?: number
  size?: number // in m²
  // WEG specific
  ownershipShare?: number // as percentage (e.g., 8.33 for 8.33%)
  owner?: string
  // MV specific
  currentRent?: number // monthly rent in EUR
  rent?: number // legacy field for compatibility
  tenant?: string
  leaseStartDate?: string
  leaseEndDate?: string
  isOccupied?: boolean
  buildingId?: string
}

export interface OnboardingBuildingData {
  id?: string
  streetName?: string
  houseNumber?: string
  postalCode?: string
  city?: string
  buildingType?: BuildingType
  floors?: number
  startingFloor?: number // Additional field for onboarding UI
  constructionYear?: number
  units?: OnboardingUnitData[]
  totalArea?: number
  propertyId?: string
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
  shareDistributionMethod?: ShareDistributionMethod
  
  // Metadata
  currentStep?: number
  completedSteps?: number[]
  lastModified?: Date
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
  PROPERTY_ID: 'buena_onboarding_property_id',
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

// Progress tracking utilities
export const PROGRESS_UTILS = {
  getProgressStatus: (percentage?: number): 'not-started' | 'in-progress' | 'completed' => {
    if (!percentage || percentage === 0) return 'not-started'
    if (percentage === 100) return 'completed'
    return 'in-progress'
  },
  
  getProgressColor: (percentage?: number): string => {
    const status = PROGRESS_UTILS.getProgressStatus(percentage)
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'in-progress': return 'bg-blue-500'
      case 'not-started': return 'bg-gray-300'
    }
  },
  
  getProgressLabel: (percentage?: number): string => {
    const status = PROGRESS_UTILS.getProgressStatus(percentage)
    switch (status) {
      case 'completed': return 'Completed'
      case 'in-progress': return 'In Progress'
      case 'not-started': return 'Not Started'
    }
  },
  
  formatPercentage: (percentage?: number): string => {
    return `${percentage || 0}%`
  }
} as const

// Component prop interfaces for better type safety
export interface OnboardingFlowProps {
  initialPropertyId?: string
  onComplete?: (propertyId: string) => void
  onCancel?: () => void
}

export interface OnboardingLayoutProps {
  currentStep: number
  steps: StepItem[]
  onCancel: () => void
  onNext: () => void
  onPrevious: () => void
  onStepClick: (stepIndex: number) => void
  isFirstStep: boolean
  isLastStep: boolean
  autoSaved: boolean
  isSaving: boolean
  lastSavedTime: Date | null
  canNavigateToStep: (step: number) => boolean
  validationErrors: string[]
  isCurrentStepValid: boolean
  children: React.ReactNode
}

export interface StepItem {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  isOptional?: boolean
}

export interface UnitsStepProps {
  buildings: OnboardingBuildingData[]
  propertyType: PropertyType
  onUpdateBuildings: (buildings: OnboardingBuildingData[]) => void
  validationErrors?: string[]
}

export interface UnitFormData extends OnboardingUnitData {
  buildingId: string
}

export interface PatternConfig {
  unitsPerFloor: number
  baseRent: number
  unitSizeVariation?: boolean
  roomVariation?: boolean
}

export interface FloorData {
  floor: number
  units: OnboardingUnitData[]
  totalSize: number
  averageSize: number
  totalRent?: number
}

export interface BuildingFormData extends Omit<OnboardingBuildingData, 'floors'> {
  hasValidUnits: boolean
  unitCount: number
  floors: FloorData[]
}

// API Response types for better type safety
export interface ApiProperty {
  id: string
  name: string
  type: PropertyType
  propertyNumber: string
  managementCompany?: string
  propertyManager?: string
  accountant?: string
  status: PropertyStatus
  buildings: ApiBuilding[]
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
  completed?: boolean
  completionPercentage?: number
  step1Complete?: boolean
  step2Complete?: boolean
  step3Complete?: boolean
  currentStep?: number
}

export interface ApiBuilding {
  id: string
  propertyId: string
  streetName: string
  houseNumber: string
  postalCode: string
  city: string
  buildingType: BuildingType
  floors: number
  constructionYear?: number
  units: ApiUnit[]
  totalArea?: number
}

export interface ApiUnit {
  id: string
  buildingId: string
  unitNumber: string
  floor: number
  type: UnitType
  rooms: number
  size: number
  ownershipShare?: number
  owner?: string
  rent?: number
  tenant?: string
  leaseStartDate?: string
  leaseEndDate?: string
  isOccupied?: boolean
  features?: Record<string, unknown>
}

// Error handling types
export interface ValidationError {
  field: string
  message: string
  code?: string
}

export interface ApiError {
  message: string
  statusCode: number
  error?: string
  details?: ValidationError[]
}

// UI State types
export interface LoadingState {
  isLoading: boolean
  message?: string
}

export interface ErrorState {
  hasError: boolean
  message?: string
  details?: string[]
}

// Performance optimization types
export interface VirtualScrollItem {
  index: number
  height: number
  offset: number
  data: OnboardingUnitData
}

export interface VirtualScrollOptions {
  itemHeight: number
  containerHeight: number
  bufferSize?: number
  overscan?: number
}