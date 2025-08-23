'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { Home, Building2, Package } from 'lucide-react'
import OnboardingLayout from './OnboardingLayout'
import PropertyStep from './steps/PropertyStep'
import BuildingsStep from './steps/BuildingsStep'
import UnitsStep from './steps/UnitsStep'
import type { Step } from '../ui/steps'

export type OnboardingStepId = 'property' | 'buildings' | 'units'

const OnboardingFlow: React.FC = () => {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [autoSaved, setAutoSaved] = useState(false)
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null)

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

  const handleAutoSave = () => {
    setAutoSaved(true)
    setLastSavedTime(new Date())
    setTimeout(() => setAutoSaved(false), 2000)
  }

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
      handleAutoSave()
    } else {
      router.push('/')
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      handleAutoSave()
    }
  }

  const handleCancel = () => {
    router.push('/')
  }

  const renderStepContent = () => {
    const stepId = onboardingSteps[currentStep].id
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
    <OnboardingLayout
      currentStep={currentStep}
      steps={onboardingSteps}
      onCancel={handleCancel}
      onNext={handleNext}
      onPrevious={handlePrevious}
      isFirstStep={currentStep === 0}
      isLastStep={currentStep === onboardingSteps.length - 1}
      autoSaved={autoSaved}
      lastSavedTime={lastSavedTime}
    >
      {renderStepContent()}
    </OnboardingLayout>
  )
}

export default OnboardingFlow