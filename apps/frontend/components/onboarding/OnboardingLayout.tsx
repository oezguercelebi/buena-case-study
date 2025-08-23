import React from 'react'
import Navbar from './Navbar'
import StepProgress from './StepProgress'
import NavigationControls from './NavigationControls'
import type { OnboardingStep } from './OnboardingFlow'

interface OnboardingLayoutProps {
  currentStep: OnboardingStep
  steps: OnboardingStep[]
  onCancel: () => void
  onNext: () => void
  onPrevious: () => void
  isFirstStep: boolean
  isLastStep: boolean
  children: React.ReactNode
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  currentStep,
  steps,
  onCancel,
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep,
  children,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar onCancel={onCancel} />
      
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-6">
        <StepProgress currentStep={currentStep} steps={steps} />
        
        <div className="flex-1 bg-white rounded-lg shadow-sm mt-6 p-6">
          {children}
        </div>
        
        <NavigationControls
          onNext={onNext}
          onPrevious={onPrevious}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
        />
      </div>
    </div>
  )
}

export default OnboardingLayout