'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Home, Building2, Package } from 'lucide-react'
import { OnboardingProvider, useOnboarding } from '../../contexts/OnboardingContext'
import { useAutosave } from '../../hooks/useAutosave'
import OnboardingLayout from './OnboardingLayout'
import PropertyStep from './steps/PropertyStep'
import BuildingsStep from './steps/BuildingsStep'
import UnitsStep from './steps/UnitsStep'
import { OnboardingEntryModal } from './OnboardingEntryModal'
import { api } from '../../utils/api'
import { STORAGE_KEYS } from '../../types/property'
import type { Step } from '../ui/steps'
import type { FieldError } from '../../services/validation'

export type OnboardingStepId = 'property' | 'buildings' | 'units'

const onboardingSteps: Step[] = [
  {
    id: 'property',
    label: 'General Information',
    description: 'Property basics',
    icon: <Home className="h-4 w-4" />,
  },
  {
    id: 'buildings',
    label: 'Building Data',
    description: 'Add buildings',
    icon: <Building2 className="h-4 w-4" />,
  },
  {
    id: 'units',
    label: 'Units',
    description: 'Configure units',
    icon: <Package className="h-4 w-4" />,
  },
]

const OnboardingFlowContent: React.FC = () => {
  const router = useRouter()
  const { state, setCurrentStep, setPropertyId, validateStep, canNavigateToStep, saveToAPI, resetOnboarding, updateData, loadFromLocalStorage } = useOnboarding()
  const { forceSave } = useAutosave({ enabled: true })
  const [validationErrors, setValidationErrors] = useState<FieldError[]>([])
  const [showEntryModal, setShowEntryModal] = useState(false)
  const [incompleteProperties, setIncompleteProperties] = useState<any[]>([])
  const [loadingProperties, setLoadingProperties] = useState(true)
  
  // Continuously validate current step to enable/disable continue button
  const currentStepValidation = validateStep(state.currentStep)
  const isCurrentStepValid = currentStepValidation.isValid
  
  // Debug validation
  if (!isCurrentStepValid) {
    console.log(`Step ${state.currentStep} validation failed:`, currentStepValidation)
    console.log('Validation errors:', currentStepValidation.errors)
    if (state.currentStep === 1) {
      console.log('Current buildings data:', state.data.buildings)
    } else if (state.currentStep === 2) {
      console.log('Current units data:', state.data.buildings?.map(b => ({ 
        address: b.address, 
        unitsCount: b.units?.length || 0,
        units: b.units 
      })))
      if (state.data.type === 'WEG' && state.data.buildings) {
        const totalOwnership = state.data.buildings
          .flatMap(b => b.units || [])
          .reduce((sum, unit) => sum + (unit.ownershipShare || 0), 0)
        console.log('Total ownership shares:', totalOwnership.toFixed(3) + '%')
      }
    }
  } else if (state.currentStep === 2) {
    // Log when Units step is valid
    console.log('Units step is VALID - Complete Property should be enabled')
  }

  // Fetch incomplete properties on mount and validate localStorage
  useEffect(() => {
    fetchIncompleteProperties()
  }, [])

  const fetchIncompleteProperties = async () => {
    try {
      setLoadingProperties(true)
      const response = await api.get<any[]>('/property')
      // Filter properties that are between 0-99% complete
      const incomplete = response.filter(
        (prop: any) => prop.completionPercentage >= 0 && prop.completionPercentage < 100
      )
      setIncompleteProperties(incomplete)
      
      // Check if there's a property ID in localStorage
      const storedPropertyId = localStorage.getItem(STORAGE_KEYS.PROPERTY_ID)
      
      if (storedPropertyId) {
        // Check if this property still exists and is incomplete
        const matchingProperty = incomplete.find(p => p.id === storedPropertyId)
        
        if (matchingProperty) {
          // Property exists and is incomplete, load localStorage data
          const success = loadFromLocalStorage()
          if (success) {
            console.log('Loaded existing onboarding data for property:', storedPropertyId)
          }
          // Show modal to let user choose to continue or start new
          if (incomplete.length > 0) {
            setShowEntryModal(true)
          }
        } else {
          // Property doesn't exist or is complete, clear localStorage
          resetOnboarding()
          // Show modal if there are other incomplete properties
          if (incomplete.length > 0) {
            setShowEntryModal(true)
          }
        }
      } else {
        // No stored property ID
        if (incomplete.length > 0) {
          // Show modal to choose from incomplete properties
          setShowEntryModal(true)
        } else {
          // No incomplete properties, ensure we start fresh
          resetOnboarding()
        }
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoadingProperties(false)
    }
  }

  const handleCreateNew = () => {
    // Completely reset onboarding state and clear all localStorage
    resetOnboarding()
    setPropertyId(null)
    setCurrentStep(0)
    setShowEntryModal(false)
  }

  const handleContinueProperty = async (propertyId: string) => {
    try {
      // First reset to clear any stale data
      resetOnboarding()
      
      // Fetch the property details
      const property = await api.get<any>(`/property/${propertyId}`)
      
      // Set the property ID in context to enable updates instead of creates
      setPropertyId(propertyId)
      
      // Ensure all buildings have IDs before loading
      const buildings = (property.buildings || []).map((b: any, index: number) => ({
        ...b,
        id: b.id || `building-${propertyId}-${index}-${Date.now()}`
      }))
      
      // Load property data into onboarding context
      updateData({
        name: property.name,
        type: property.type,
        propertyNumber: property.propertyNumber,
        address: property.address,
        managementCompany: property.managementCompany,
        propertyManager: property.propertyManager,
        accountant: property.accountant,
        buildings,
      })
      
      // Always start from the beginning to allow reviewing/editing all steps
      setCurrentStep(0)
      
      setShowEntryModal(false)
    } catch (error) {
      console.error('Error loading property:', error)
    }
  }

  const handleNext = async () => {
    // Validate current step before proceeding
    const validation = validateStep(state.currentStep)
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      return
    }

    setValidationErrors([])

    if (state.currentStep < onboardingSteps.length - 1) {
      setCurrentStep(state.currentStep + 1)
      forceSave() // Force save on step navigation
    } else {
      // Final step - save to API and complete
      try {
        await saveToAPI(true) // Pass true to indicate completion
        // Clear localStorage and property ID after successful completion
        localStorage.removeItem(STORAGE_KEYS.ONBOARDING_DATA)
        localStorage.removeItem(STORAGE_KEYS.ONBOARDING_STEP)
        localStorage.removeItem(STORAGE_KEYS.LAST_SAVED)
        localStorage.removeItem(STORAGE_KEYS.PROPERTY_ID)
        router.push('/properties') // Redirect to properties list
      } catch (error) {
        console.error('Failed to complete onboarding:', error)
        setValidationErrors([{ field: 'general', message: 'Failed to save property. Please try again.' }])
      }
    }
  }

  const handlePrevious = () => {
    if (state.currentStep > 0) {
      setCurrentStep(state.currentStep - 1)
      setValidationErrors([]) // Clear errors when going back
    }
  }

  const handleStepClick = (stepIndex: number) => {
    if (canNavigateToStep(stepIndex)) {
      setCurrentStep(stepIndex)
      setValidationErrors([])
    }
  }

  const handleCancel = () => {
    // No need for confirmation since we're auto-saving
    router.push('/')
  }

  const renderStepContent = () => {
    const stepId = onboardingSteps[state.currentStep].id
    switch (stepId) {
      case 'property':
        return <PropertyStep validationErrors={validationErrors} />
      case 'buildings':
        return <BuildingsStep />
      case 'units':
        return <UnitsStep />
      default:
        return null
    }
  }

  return (
    <div>
      {/* Entry Modal */}
      <OnboardingEntryModal
        open={showEntryModal}
        incompleteProperties={incompleteProperties}
        loading={loadingProperties}
        onCreateNew={handleCreateNew}
        onContinueProperty={handleContinueProperty}
      />

      <OnboardingLayout
        currentStep={state.currentStep}
        steps={onboardingSteps}
        onCancel={handleCancel}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onStepClick={handleStepClick}
        isFirstStep={state.currentStep === 0}
        isLastStep={state.currentStep === onboardingSteps.length - 1}
        autoSaved={!state.hasUnsavedChanges && state.lastSaved !== null}
        isSaving={state.isSaving}
        lastSavedTime={state.lastSaved}
        canNavigateToStep={canNavigateToStep}
        validationErrors={validationErrors.map(e => e.message)}
        isCurrentStepValid={isCurrentStepValid}
      >
        {renderStepContent()}
      </OnboardingLayout>
    </div>
  )
}

const OnboardingFlow: React.FC = () => {
  return (
    <OnboardingProvider>
      <OnboardingFlowContent />
    </OnboardingProvider>
  )
}

export default OnboardingFlow