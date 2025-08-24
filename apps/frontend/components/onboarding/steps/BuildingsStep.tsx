'use client'

import React, { useState, useEffect } from 'react'
import { Building, X, MapPin, Calendar, Layers, Plus, Sparkles } from 'lucide-react'
import { Card } from '../../ui/card'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { useOnboarding } from '../../../contexts/OnboardingContext'
import { BuildingType as BuildingCategory, OnboardingBuildingData } from '../../../types/property'

const BuildingsStep: React.FC = () => {
  const { state, updateData } = useOnboarding()
  const [showBuildingForm, setShowBuildingForm] = useState(false)
  const [selectedBuildingType, setSelectedBuildingType] = useState<BuildingCategory | null>(null)
  const [editingBuilding, setEditingBuilding] = useState<OnboardingBuildingData | null>(null)

  // Initialize buildings from context
  const buildings = state.data.buildings || []
  
  // Helper to ensure all buildings have IDs and addresses (for validation)
  React.useEffect(() => {
    const needsUpdate = buildings.some(b => !b.id)
    if (needsUpdate) {
      const updatedBuildings = buildings.map(b => ({
        ...b,
        // Ensure every building has an ID
        id: b.id || `building-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }))
      console.log('BuildingsStep: Fixed missing IDs/addresses:', updatedBuildings)
      updateData({ buildings: updatedBuildings })
    }
  }, [buildings.length]) // Re-run when number of buildings changes
  
  // Form state
  const [formData, setFormData] = useState({
    streetName: '',
    houseNumber: '',
    postalCode: '',
    city: '',
    floors: 6,
    startingFloor: 0,
    constructionYear: 2020
  })

  const handleSaveBuilding = () => {
    // Generate a unique ID for new buildings
    const buildingId = editingBuilding?.id || `building-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const newBuilding: OnboardingBuildingData = {
      id: buildingId,
      streetName: formData.streetName,
      houseNumber: formData.houseNumber,
      postalCode: formData.postalCode,
      city: formData.city,
      // address is computed from individual fields
      buildingType: selectedBuildingType || 'neubau',
      floors: formData.floors,
      startingFloor: formData.startingFloor,
      constructionYear: formData.constructionYear,
      units: editingBuilding?.units || []
    }

    let updatedBuildings: OnboardingBuildingData[]

    if (editingBuilding && editingBuilding.id) {
      // Update existing building
      updatedBuildings = buildings.map(b => 
        b.id === editingBuilding.id ? newBuilding : b
      )
    } else {
      // Add new building
      updatedBuildings = [...buildings, newBuilding]
    }

    // Update context
    updateData({ buildings: updatedBuildings })

    // Reset form
    setShowBuildingForm(false)
    setEditingBuilding(null)
    setSelectedBuildingType(null)
    setFormData({
      streetName: '',
      houseNumber: '',
      postalCode: '',
      city: '',
      floors: 6,
      startingFloor: 0,
      constructionYear: 2020
    })
  }

  const handleEditBuilding = (building: OnboardingBuildingData) => {
    setEditingBuilding(building)
    // Parse address back into components if available
    let streetName = building.streetName || ''
    let houseNumber = building.houseNumber || ''
    let postalCode = building.postalCode || ''
    let city = building.city || ''
    
    // Note: Address is computed from individual fields in the new shared types
    
    setFormData({
      streetName,
      houseNumber,
      postalCode,
      city,
      floors: building.floors || 6,
      startingFloor: building.startingFloor ?? 0,
      constructionYear: building.constructionYear || 2020
    })
    setSelectedBuildingType(building.buildingType || 'neubau')
    setShowBuildingForm(true)
  }

  const handleDeleteBuilding = (buildingId: string | undefined) => {
    if (!buildingId) return
    const updatedBuildings = buildings.filter(b => b.id !== buildingId)
    updateData({ buildings: updatedBuildings })
  }

  const buildingTypes: { id: BuildingCategory; label: string; desc: string; suggestedFloors: number; suggestedYear: number }[] = [
    { id: 'altbau', label: 'Altbau', desc: 'Pre-war, ~5 floors', suggestedFloors: 5, suggestedYear: 1900 },
    { id: 'neubau', label: 'Neubau', desc: 'Modern, 4-8 floors', suggestedFloors: 6, suggestedYear: 2020 },
    { id: 'hochhaus', label: 'Hochhaus', desc: 'High-rise, 9+ floors', suggestedFloors: 12, suggestedYear: 1975 },
    { id: 'mixed', label: 'Mixed-use', desc: 'Commercial + Residential', suggestedFloors: 6, suggestedYear: 2010 }
  ]

  // Auto-update form fields when building type is selected
  useEffect(() => {
    if (selectedBuildingType && !editingBuilding) {
      const selectedType = buildingTypes.find(type => type.id === selectedBuildingType)
      if (selectedType) {
        setFormData(prev => ({
          ...prev,
          floors: selectedType.suggestedFloors,
          constructionYear: selectedType.suggestedYear
        }))
      }
    }
  }, [selectedBuildingType, editingBuilding])

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Building Data</h2>
        <p className="text-muted-foreground">
          Add buildings to your property
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Each property can contain multiple buildings
        </p>
      </div>

      {/* Building List Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Buildings</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowBuildingForm(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Building
        </Button>
      </div>

      {/* Building Configuration Form */}
      {showBuildingForm && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">
              {editingBuilding ? 'Edit Building' : 'Building Details'}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowBuildingForm(false)
                setEditingBuilding(null)
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            {/* Street and House Number */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Street Name *
                </Label>
                <Input
                  type="text"
                  autoComplete="off"
                  placeholder="e.g., Hauptstraße"
                  value={formData.streetName}
                  onChange={(e) => setFormData({ ...formData, streetName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>House Number *</Label>
                <Input
                  type="text"
                  autoComplete="off"
                  placeholder="e.g., 123"
                  value={formData.houseNumber}
                  onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                />
              </div>
            </div>

            {/* Additional Address Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Postal Code *</Label>
                <Input
                  type="text"
                  autoComplete="postal-code"
                  placeholder="e.g., 10115"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>City *</Label>
                <Input
                  type="text"
                  autoComplete="address-level2"
                  placeholder="e.g., Berlin"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
            </div>

            {/* Building Type Selector */}
            <div className="space-y-2">
              <Label>Building Type *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {buildingTypes.map((type) => (
                  <button
                    key={type.id}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedBuildingType === type.id
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedBuildingType(type.id)}
                  >
                    <p className="font-medium text-sm">{type.label}</p>
                    <p className="text-xs text-muted-foreground">{type.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Floor Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  Number of Floors *
                </Label>
                <Input
                  type="number"
                  autoComplete="off"
                  placeholder={selectedBuildingType === 'altbau' ? '5' : selectedBuildingType === 'hochhaus' ? '12' : '6'}
                  min="1"
                  max="50"
                  value={formData.floors || ''}
                  onChange={(e) => setFormData({ ...formData, floors: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground">
                  {selectedBuildingType === 'altbau' && 'Typically 4-6 floors'}
                  {selectedBuildingType === 'neubau' && 'Typically 4-8 floors'}
                  {selectedBuildingType === 'hochhaus' && 'Typically 9-20 floors'}
                  {selectedBuildingType === 'mixed' && 'Varies by building'}
                  {!selectedBuildingType && 'Enter number of floors'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Starting Floor</Label>
                <select 
                  autoComplete="off"
                  className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                  value={formData.startingFloor}
                  onChange={(e) => setFormData({ ...formData, startingFloor: parseInt(e.target.value) })}
                >
                  <option value="-5">-5 (Sub-basement 5)</option>
                  <option value="-4">-4 (Sub-basement 4)</option>
                  <option value="-3">-3 (Sub-basement 3)</option>
                  <option value="-2">-2 (Sub-basement 2)</option>
                  <option value="-1">-1 (Basement)</option>
                  <option value="0">0 (Ground/EG)</option>
                  <option value="1">1 (First)</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  German convention: EG = 0
                </p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Construction Year
                </Label>
                <Input
                  type="number"
                  autoComplete="off"
                  placeholder={selectedBuildingType === 'altbau' ? '1900' : selectedBuildingType === 'neubau' ? '2020' : 'YYYY'}
                  min="1800"
                  max={new Date().getFullYear()}
                  value={formData.constructionYear || ''}
                  onChange={(e) => setFormData({ ...formData, constructionYear: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground">
                  {selectedBuildingType === 'altbau' && 'Pre-1945 construction'}
                  {selectedBuildingType === 'neubau' && 'Post-1990 construction'}
                  {selectedBuildingType === 'hochhaus' && 'Typically 1960s onwards'}
                  {!selectedBuildingType && 'Year the building was constructed'}
                </p>
              </div>
            </div>

          </div>

          {/* Save Building Button */}
          <div className="flex justify-end mt-6">
            <Button
              onClick={handleSaveBuilding}
              disabled={!formData.streetName || !formData.houseNumber || !formData.postalCode || !formData.city}
            >
              {editingBuilding ? 'Update Building' : 'Save Building'}
            </Button>
          </div>
        </Card>
      )}

      {/* Display Added Buildings */}
      {buildings.length > 0 && (
        <div className="space-y-3">
          {buildings
            .filter(building => !editingBuilding || building.id !== editingBuilding.id)
            .map((building) => (
            <Card key={building.id || `temp-${Math.random()}`} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Building className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{building.streetName} {building.houseNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {building.postalCode} {building.city} • {
                        building.buildingType === 'altbau' ? 'Altbau' :
                        building.buildingType === 'neubau' ? 'Neubau' :
                        building.buildingType === 'hochhaus' ? 'Hochhaus' : 'Mixed-use'
                      } • {building.floors} floors
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleEditBuilding(building)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteBuilding(building.id || '')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {buildings.length === 0 && !showBuildingForm && !editingBuilding && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <Building className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No buildings added</h3>
          <p className="mt-2 text-sm text-gray-500">
            Get started by adding your first building
          </p>
          <Button
            className="mt-4"
            onClick={() => setShowBuildingForm(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Building
          </Button>
        </div>
      )}

      {/* Info Message */}
      {buildings.length > 0 && (
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm">
            <span className="font-medium">Tip:</span> You can add multiple buildings to your property. 
            Each building will have its own units configuration in the next step.
          </p>
        </div>
      )}
    </div>
  )
}

export default BuildingsStep