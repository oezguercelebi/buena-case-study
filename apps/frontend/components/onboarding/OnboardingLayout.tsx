import React from 'react'
import { X, Check, Save, ArrowLeft, ChevronRight } from 'lucide-react'
import { Steps, type Step } from '../ui/steps'

interface OnboardingLayoutProps {
  currentStep: number
  steps: Step[]
  onCancel: () => void
  onNext: () => void
  onPrevious: () => void
  onStepClick?: (stepIndex: number) => void
  isFirstStep: boolean
  isLastStep: boolean
  autoSaved: boolean
  isSaving: boolean
  lastSavedTime: Date | null
  canNavigateToStep?: (stepIndex: number) => boolean
  validationErrors?: string[]
  isCurrentStepValid?: boolean
  children: React.ReactNode
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  currentStep,
  steps,
  onCancel,
  onNext,
  onPrevious,
  onStepClick,
  isFirstStep,
  isLastStep,
  autoSaved,
  isSaving,
  lastSavedTime,
  canNavigateToStep,
  validationErrors = [],
  isCurrentStepValid = true,
  children,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Navigation Bar with Steps */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Close button */}
            <div className="flex-shrink-0">
              <button
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                onClick={onCancel}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Center - Progress Steps */}
            <div className="flex-grow mx-8">
              <Steps
                currentStep={currentStep}
                steps={steps}
                allowClickableSteps={true}
                displayMode="icon-only"
                onStepClick={onStepClick}
                canNavigateToStep={canNavigateToStep}
              />
            </div>

            {/* Right side - Auto-save indicator */}
            <div className="flex-shrink-0 w-20">
              <div className="flex items-center justify-end gap-1.5 text-xs">
                {isSaving ? (
                  <>
                    <Save className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                    <span className="text-amber-500">Saving...</span>
                  </>
                ) : autoSaved ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-green-500">Saved</span>
                  </>
                ) : lastSavedTime ? (
                  <>
                    <Save className="h-3.5 w-3.5 text-gray-500" />
                    <span className="text-gray-500">
                      {lastSavedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5 text-gray-500" />
                    <span className="text-gray-500">Not saved</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button
              className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center cursor-pointer"
              onClick={onPrevious}
              disabled={isFirstStep}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </button>

            <button
              className="px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center cursor-pointer"
              onClick={onNext}
              disabled={!isCurrentStepValid}
            >
              {isLastStep ? 'Complete Property' : 'Continue'}
              <ChevronRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingLayout