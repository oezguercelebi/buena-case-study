'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/router'
import OnboardingLayout from './OnboardingLayout'
import PropertyStep from './steps/PropertyStep'
import BuildingsStep from './steps/BuildingsStep'
import UnitsStep from './steps/UnitsStep'

export type OnboardingStep = 'property' | 'buildings' | 'units'

const STEPS: OnboardingStep[] = ['property', 'buildings', 'units']

const OnboardingFlow: React.FC = () => {
  const router = useRouter()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const currentStep = STEPS[currentStepIndex]

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    } else {
      router.push('/')
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const handleCancel = () => {
    router.push('/')
  }

  const renderStepContent = () => {
    switch (currentStep) {
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
      steps={STEPS}
      onCancel={handleCancel}
      onNext={handleNext}
      onPrevious={handlePrevious}
      isFirstStep={currentStepIndex === 0}
      isLastStep={currentStepIndex === STEPS.length - 1}
    >
      {renderStepContent()}
    </OnboardingLayout>
  )
}

export default OnboardingFlow