import React from 'react'

const UnitsStep: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Units Information</h2>
        <p className="mt-2 text-gray-600">
          Add and configure units for your buildings
        </p>
      </div>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">Unit Management</h3>
        <p className="mt-2 text-sm text-gray-500">
          Unit configuration interface will be added here
        </p>
      </div>
    </div>
  )
}

export default UnitsStep