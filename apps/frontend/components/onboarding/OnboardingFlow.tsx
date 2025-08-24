'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Home, Building2, Package, AlertCircle } from 'lucide-react'
import { OnboardingProvider, useOnboarding } from '../../contexts/OnboardingContext'
import { useAutosave } from '../../hooks/useAutosave'
import OnboardingLayout from './OnboardingLayout'
import PropertyStep from './steps/PropertyStep'
import BuildingsStep from './steps/BuildingsStep'
import UnitsStep from './steps/UnitsStep'
import type { Step } from '../ui/steps'

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
  const { state, setCurrentStep, validateStep, canNavigateToStep, saveToAPI, resetOnboarding } = useOnboarding()
  const { forceSave } = useAutosave({ enabled: true })
  const [validationErrors, setValidationErrors] = useState<string[]>([])

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
        await saveToAPI()
        router.push('/properties') // Redirect to properties list
      } catch (error) {
        console.error('Failed to complete onboarding:', error)
        setValidationErrors(['Failed to save property. Please try again.'])
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
    if (state.hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        resetOnboarding()
        router.push('/')
      }
    } else {
      router.push('/')
    }
  }

  const renderStepContent = () => {
    const stepId = onboardingSteps[state.currentStep].id
    switch (stepId) {
      case 'property':
        return <PropertyStep />
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
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-1">
                  Please fix the following errors:
                </h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

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
        lastSavedTime={state.lastSaved}
        canNavigateToStep={canNavigateToStep}
        validationErrors={validationErrors}
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