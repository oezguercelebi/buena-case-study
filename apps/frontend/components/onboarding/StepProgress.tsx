import React from 'react'
import type { OnboardingStep } from './OnboardingFlow'

interface StepProgressProps {
  currentStep: OnboardingStep
  steps: OnboardingStep[]
}

const STEP_LABELS: Record<OnboardingStep, string> = {
  property: 'Property',
  buildings: 'Buildings',
  units: 'Units',
}

const StepProgress: React.FC<StepProgressProps> = ({ currentStep, steps }) => {
  const currentStepIndex = steps.indexOf(currentStep)

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex
          const isCompleted = index < currentStepIndex
          
          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                    ${isActive 
                      ? 'bg-blue-600 text-white' 
                      : isCompleted 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`
                    mt-2 text-sm font-medium
                    ${isActive ? 'text-blue-600' : 'text-gray-600'}
                  `}
                >
                  {STEP_LABELS[step]}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-4
                    ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}
                  `}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

export default StepProgress