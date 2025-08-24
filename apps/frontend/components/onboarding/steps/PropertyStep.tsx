'use client'

import React, { useState, useEffect } from 'react'
import { Building, Home as HomeIcon, Upload, Sparkles, FileCheck } from 'lucide-react'
import { useOnboarding } from '../../../contexts/OnboardingContext'
import { PropertyType } from '../../../types/property'

const PropertyStep: React.FC = () => {
  const { state, updateData } = useOnboarding()
  
  // Local state for UI interaction
  const [selectedPropertyType, setSelectedPropertyType] = useState<PropertyType | null>(
    state.data.type || null
  )
  const [uploadedFile, setUploadedFile] = useState<File | null>(
    state.data.uploadedDocument || null
  )

  // Sync local state with context when component mounts
  useEffect(() => {
    if (state.data.type && !selectedPropertyType) {
      setSelectedPropertyType(state.data.type)
    }
    if (state.data.uploadedDocument && !uploadedFile) {
      setUploadedFile(state.data.uploadedDocument)
    }
  }, [state.data.type, state.data.uploadedDocument, selectedPropertyType, uploadedFile])

  // Handle property type selection
  const handlePropertyTypeSelection = (type: PropertyType) => {
    setSelectedPropertyType(type)
    updateData({ 
      type: type,
      // Set smart defaults based on property type
      name: type === 'WEG' ? '' : '', // Will be filled with smart suggestions
      aiExtractionEnabled: true,
    })
  }

  // Handle file upload
  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
    updateData({ uploadedDocument: file })
  }

  // Handle form field changes
  const handleFieldChange = (field: string, value: string) => {
    updateData({ [field]: value })
  }

  if (!selectedPropertyType) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-2">Select Property Type</h2>
          <p className="text-gray-600">
            Choose the type of property you want to onboard
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            className="relative p-8 cursor-pointer transition-all border rounded-lg hover:shadow-lg hover:border-gray-400 bg-white"
            onClick={() => handlePropertyTypeSelection('WEG')}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 rounded-full bg-gray-100">
                <Building className="h-12 w-12" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">WEG Property</h3>
                <p className="text-sm text-gray-600">
                  Condominium property with multiple owners and shared ownership
                </p>
              </div>
              <div className="pt-4 flex justify-center">
                <ul className="text-xs text-gray-600 space-y-1 text-left">
                  <li>• Ownership shares management</li>
                  <li>• Multiple unit owners</li>
                  <li>• Common area allocation</li>
                </ul>
              </div>
            </div>
          </div>

          <div 
            className="relative p-8 cursor-pointer transition-all border rounded-lg hover:shadow-lg hover:border-gray-400 bg-white"
            onClick={() => handlePropertyTypeSelection('MV')}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 rounded-full bg-gray-100">
                <HomeIcon className="h-12 w-12" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">MV Property</h3>
                <p className="text-sm text-gray-600">
                  Rental property with tenant management and rent tracking
                </p>
              </div>
              <div className="pt-4 flex justify-center">
                <ul className="text-xs text-gray-600 space-y-1 text-left">
                  <li>• Rent roll management</li>
                  <li>• Tenant tracking</li>
                  <li>• Lease administration</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">General Information</h2>
        <p className="text-gray-600">
          Upload your document and let AI fill out everything for you
        </p>
      </div>

      <div className="border rounded-lg p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-black" />
              AI Document Extraction
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Upload your property documents and AI will extract all the details
            </p>
          </div>
        </div>

        {!uploadedFile ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
               onClick={() => document.getElementById('file-upload')?.click()}>
            <div className="flex flex-col items-center space-y-3">
              <div className="p-3 rounded-full bg-gray-100">
                <Upload className="h-6 w-6 text-black" />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Drop your document here or click to browse</p>
                <p className="text-xs text-gray-600">PDF, JPG, PNG (Max 10MB)</p>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                AI will automatically extract: property details, addresses, unit information, ownership data, and more
              </p>
              <input
                type="file"
                className="hidden"
                id="file-upload"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileUpload(e.target.files[0])
                  }
                }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="border rounded-lg p-4 bg-green-50 border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileCheck className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">{uploadedFile.name}</p>
                    <p className="text-xs text-gray-600">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for AI extraction
                    </p>
                  </div>
                </div>
                <button
                  className="text-sm text-gray-600 hover:text-gray-900"
                  onClick={() => {
                    setUploadedFile(null)
                    updateData({ uploadedDocument: undefined })
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="p-3 bg-gray-100 rounded-md">
              <p className="text-xs text-gray-700 flex items-center gap-2">
                <Sparkles className="h-3 w-3 animate-pulse" />
                AI will extract and fill all property information automatically
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-grow h-px bg-gray-200"></div>
        <span className="text-sm text-gray-600">OR</span>
        <div className="flex-grow h-px bg-gray-200"></div>
      </div>

      <div className="border rounded-lg p-6 bg-white">
        <h3 className="text-sm font-medium mb-4">Enter Details Manually</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Property Name *</label>
            <input
              type="text"
              className="w-full h-9 px-3 rounded-md border bg-white"
              placeholder={selectedPropertyType === 'WEG' ? 'e.g., Hauptstraße 123 WEG' : 'e.g., Hauptstraße 123'}
              value={state.data.name || ''}
              onChange={(e) => handleFieldChange('name', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Property Number *</label>
            <input
              type="text"
              className="w-full h-9 px-3 rounded-md border bg-white"
              placeholder="Unique identifier"
              value={state.data.propertyNumber || ''}
              onChange={(e) => handleFieldChange('propertyNumber', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Management Company</label>
            <input
              type="text"
              className="w-full h-9 px-3 rounded-md border bg-white"
              placeholder="Pre-filled from profile"
              value={state.data.managementCompany || ''}
              onChange={(e) => handleFieldChange('managementCompany', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Property Manager</label>
            <input
              type="text"
              className="w-full h-9 px-3 rounded-md border bg-white"
              placeholder="Pre-filled from user"
              value={state.data.propertyManager || ''}
              onChange={(e) => handleFieldChange('propertyManager', e.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Accountant</label>
            <select 
              className="w-full h-9 px-3 rounded-md border bg-white"
              value={state.data.accountant || ''}
              onChange={(e) => handleFieldChange('accountant', e.target.value)}
            >
              <option value="">Select from team...</option>
              <option value="john-doe">John Doe - Accounting</option>
              <option value="jane-smith">Jane Smith - Finance</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyStep