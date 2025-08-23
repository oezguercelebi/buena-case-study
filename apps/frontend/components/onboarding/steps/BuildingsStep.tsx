import React from 'react'

const BuildingsStep: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Buildings Information</h2>
        <p className="mt-2 text-gray-600">
          Configure the buildings in your property
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
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">Building Configuration</h3>
        <p className="mt-2 text-sm text-gray-500">
          Building management interface will be added here
        </p>
      </div>
    </div>
  )
}

export default BuildingsStep