import React from 'react'
import AutosaveIndicator from './AutosaveIndicator'

interface NavbarProps {
  onCancel: () => void
}

const Navbar: React.FC<NavbarProps> = ({ onCancel }) => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button
            onClick={onCancel}
            className="text-gray-600 hover:text-gray-900 font-medium text-sm flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Cancel
          </button>
          
          <AutosaveIndicator />
        </div>
      </div>
    </div>
  )
}

export default Navbar