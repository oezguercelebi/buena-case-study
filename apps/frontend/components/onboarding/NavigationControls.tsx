import React from 'react'

interface NavigationControlsProps {
  onNext: () => void
  onPrevious: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep,
}) => {
  return (
    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
      <button
        onClick={onPrevious}
        disabled={isFirstStep}
        className={`
          px-6 py-2 rounded-lg font-medium transition-colors
          ${isFirstStep
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }
        `}
      >
        Previous
      </button>
      
      <button
        onClick={onNext}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        {isLastStep ? 'Complete' : 'Next'}
      </button>
    </div>
  )
}

export default NavigationControls