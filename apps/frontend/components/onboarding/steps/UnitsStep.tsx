'use client'

import React, { useState } from 'react'
import { Building, Home, ChevronLeft, ChevronRight, X, Plus } from 'lucide-react'
import { Card } from '../../ui/card'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { useOnboarding } from '../../../contexts/OnboardingContext'
import { OnboardingUnitData, UnitType } from '../../../types/property'

const UnitsStep: React.FC = () => {
  const { state, updateData } = useOnboarding()
  const buildings = state.data.buildings || []
  const propertyType = state.data.type || 'WEG'
  
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(buildings[0]?.id || '')
  const [currentFloor, setCurrentFloor] = useState(1)
  
  // Simple pattern configuration
  const [patternConfig, setPatternConfig] = useState({
    unitsPerFloor: 4,
    baseRent: 12.50, // EUR per m²
  })

  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId)
  const units = selectedBuilding?.units || []

  const generateUnits = () => {
    if (!selectedBuilding) return

    const generatedUnits: OnboardingUnitData[] = []
    const totalUnits = selectedBuilding.floors * patternConfig.unitsPerFloor
    
    for (let floor = 1; floor <= selectedBuilding.floors; floor++) {
      for (let unitNum = 1; unitNum <= patternConfig.unitsPerFloor; unitNum++) {
        // Smart defaults based on unit position
        const isSmallUnit = unitNum <= 2 // First 2 units per floor are smaller
        
        const unit: OnboardingUnitData = {
          id: `${selectedBuildingId}-${floor}-${unitNum}`,
          buildingId: selectedBuildingId,
          unitNumber: `${floor}${unitNum.toString().padStart(2, '0')}`,
          floor,
          type: 'apartment',
          rooms: isSmallUnit ? 2 : 3,
          size: isSmallUnit ? 65 : 85,
        }

        if (propertyType === 'WEG') {
          // Equal ownership shares
          unit.ownershipShare = parseFloat((100 / totalUnits).toFixed(3))
        } else if (propertyType === 'MV') {
          // Higher rent for higher floors
          const floorMultiplier = 1 + ((floor - 1) * 0.02) // 2% increase per floor
          unit.rent = Math.round(unit.size * patternConfig.baseRent * floorMultiplier)
        }

        generatedUnits.push(unit)
      }
    }

    // Update the building with new units
    const updatedBuilding = { ...selectedBuilding, units: generatedUnits }
    const updatedBuildings = buildings.map(b => 
      b.id === selectedBuildingId ? updatedBuilding : b
    )
    updateData({ buildings: updatedBuildings })
    setCurrentFloor(1) // Reset to first floor
  }

  const updateUnit = (unitId: string, field: string, value: any) => {
    if (!selectedBuilding) return

    const updatedUnits = units.map(unit => 
      unit.id === unitId 
        ? { ...unit, [field]: value }
        : unit
    )

    const updatedBuilding = { ...selectedBuilding, units: updatedUnits }
    const updatedBuildings = buildings.map(b => 
      b.id === selectedBuildingId ? updatedBuilding : b
    )
    updateData({ buildings: updatedBuildings })
  }

  const deleteUnit = (unitId: string) => {
    if (!selectedBuilding) return

    const updatedUnits = units.filter(unit => unit.id !== unitId)
    const updatedBuilding = { ...selectedBuilding, units: updatedUnits }
    const updatedBuildings = buildings.map(b => 
      b.id === selectedBuildingId ? updatedBuilding : b
    )
    updateData({ buildings: updatedBuildings })
  }

  const addUnit = () => {
    if (!selectedBuilding) return

    const newUnit: OnboardingUnitData = {
      id: `${selectedBuildingId}-${Date.now()}`,
      buildingId: selectedBuildingId,
      unitNumber: '',
      floor: currentFloor,
      type: 'apartment',
      rooms: 2,
      size: 65,
      ownershipShare: propertyType === 'WEG' ? 0 : undefined,
      rent: propertyType === 'MV' ? 0 : undefined,
    }

    const updatedUnits = [...units, newUnit].sort((a, b) => {
      // Sort by floor, then by unit number
      if (a.floor !== b.floor) return a.floor - b.floor
      return (a.unitNumber || '').localeCompare(b.unitNumber || '')
    })

    const updatedBuilding = { ...selectedBuilding, units: updatedUnits }
    const updatedBuildings = buildings.map(b => 
      b.id === selectedBuildingId ? updatedBuilding : b
    )
    updateData({ buildings: updatedBuildings })
  }

  const currentFloorUnits = units.filter(u => u.floor === currentFloor)
  const totalOwnershipShare = units.reduce((sum, u) => sum + (u.ownershipShare || 0), 0)
  const isOwnershipValid = propertyType === 'WEG' ? Math.abs(totalOwnershipShare - 100) < 0.01 : true

  if (buildings.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-2">Configure Units</h2>
          <p className="text-muted-foreground">
            Please add buildings first before configuring units
          </p>
        </div>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <Home className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No buildings available</h3>
          <p className="mt-2 text-sm text-gray-500">
            Go back to the previous step to add buildings
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Configure Units</h2>
        <p className="text-muted-foreground">
          Set up units for each building
        </p>
      </div>

      {/* Building Selector (if multiple buildings) */}
      {buildings.length > 1 && (
        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          {buildings.map((building) => (
            <button
              key={building.id}
              className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-all cursor-pointer ${
                selectedBuildingId === building.id 
                  ? 'bg-background shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => {
                setSelectedBuildingId(building.id)
                setCurrentFloor(1)
              }}
            >
              <Building className="inline h-3 w-3 mr-2" />
              {building.streetName} {building.houseNumber}
            </button>
          ))}
        </div>
      )}

      {/* Building Info */}
      {selectedBuilding && (
        <Card className="p-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{selectedBuilding.streetName} {selectedBuilding.houseNumber}</p>
              <p className="text-sm text-muted-foreground">
                {selectedBuilding.floors} floors • {selectedBuilding.buildingType}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{units.length}</p>
              <p className="text-sm text-muted-foreground">units configured</p>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Generation Card */}
      {units.length === 0 && selectedBuilding && (
        <Card className="p-6">
          <h3 className="font-medium mb-4">Quick Unit Setup</h3>
          <div className="space-y-4">
            <div>
              <Label>Units per floor</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={patternConfig.unitsPerFloor}
                onChange={(e) => setPatternConfig({
                  ...patternConfig,
                  unitsPerFloor: parseInt(e.target.value) || 4
                })}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Total: {selectedBuilding.floors} floors × {patternConfig.unitsPerFloor} units = {selectedBuilding.floors * patternConfig.unitsPerFloor} units
              </p>
            </div>

            {propertyType === 'MV' && (
              <div>
                <Label>Base rent per m²</Label>
                <Input
                  type="number"
                  step="0.50"
                  value={patternConfig.baseRent}
                  onChange={(e) => setPatternConfig({
                    ...patternConfig,
                    baseRent: parseFloat(e.target.value) || 12.50
                  })}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Higher floors will have slightly higher rent (+2% per floor)
                </p>
              </div>
            )}

            <Button onClick={generateUnits} className="w-full">
              Generate {selectedBuilding.floors * patternConfig.unitsPerFloor} Units
            </Button>
          </div>
        </Card>
      )}

      {/* Units Grid Table View */}
      {units.length > 0 && selectedBuilding && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Unit Configuration</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const updatedBuilding = { ...selectedBuilding, units: [] }
                const updatedBuildings = buildings.map(b => 
                  b.id === selectedBuildingId ? updatedBuilding : b
                )
                updateData({ buildings: updatedBuildings })
                setCurrentFloor(1)
              }}
            >
              Regenerate All
            </Button>
          </div>

          {/* Ownership validation for WEG */}
          {propertyType === 'WEG' && (
            <div className={`p-3 rounded-lg ${isOwnershipValid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <p className="text-sm font-medium">
                Total Ownership: {totalOwnershipShare.toFixed(3)}% 
                {isOwnershipValid ? ' ✓' : ' (must equal 100%)'}
              </p>
            </div>
          )}

          {/* Grid Table */}
          <Card className="p-6">
            <div className="space-y-4">
              {/* Floor Navigation */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentFloor(Math.max(1, currentFloor - 1))}
                  disabled={currentFloor === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous Floor
                </Button>
                
                <div className="text-center">
                  <p className="text-lg font-medium">Floor {currentFloor}</p>
                  <p className="text-sm text-muted-foreground">
                    {currentFloorUnits.length} units on this floor
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentFloor(Math.min(selectedBuilding.floors, currentFloor + 1))}
                  disabled={currentFloor === selectedBuilding.floors}
                >
                  Next Floor
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Floor selector pills */}
              <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
                {Array.from({ length: selectedBuilding.floors }, (_, i) => i + 1).map(floor => (
                  <button
                    key={floor}
                    onClick={() => setCurrentFloor(floor)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all cursor-pointer ${
                      currentFloor === floor
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {floor}
                  </button>
                ))}
              </div>

              {/* Units Table for Current Floor */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 text-sm font-medium">Unit #</th>
                      <th className="text-left p-2 text-sm font-medium">Type</th>
                      <th className="text-left p-2 text-sm font-medium">Rooms</th>
                      <th className="text-left p-2 text-sm font-medium">Size (m²)</th>
                      {propertyType === 'WEG' && (
                        <th className="text-left p-2 text-sm font-medium">Share (%)</th>
                      )}
                      {propertyType === 'MV' && (
                        <th className="text-left p-2 text-sm font-medium">Rent (€)</th>
                      )}
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentFloorUnits.map((unit) => (
                      <tr key={unit.id} className="border-b hover:bg-muted/30">
                        <td className="p-1">
                          <Input
                            type="text"
                            className="h-8 text-sm"
                            value={unit.unitNumber || ''}
                            onChange={(e) => updateUnit(unit.id, 'unitNumber', e.target.value)}
                          />
                        </td>
                        <td className="p-1">
                          <select 
                            className="w-full h-8 px-2 rounded border bg-background text-sm"
                            value={unit.type || 'apartment'}
                            onChange={(e) => updateUnit(unit.id, 'type', e.target.value as UnitType)}
                          >
                            <option value="apartment">Apartment</option>
                            <option value="office">Office</option>
                            <option value="parking">Parking</option>
                            <option value="storage">Storage</option>
                          </select>
                        </td>
                        <td className="p-1">
                          <Input
                            type="number"
                            className="h-8 text-sm"
                            min="0"
                            max="10"
                            value={unit.rooms || ''}
                            onChange={(e) => updateUnit(unit.id, 'rooms', parseInt(e.target.value) || 0)}
                          />
                        </td>
                        <td className="p-1">
                          <Input
                            type="number"
                            className="h-8 text-sm"
                            min="10"
                            max="500"
                            value={unit.size || ''}
                            onChange={(e) => updateUnit(unit.id, 'size', parseInt(e.target.value) || 0)}
                          />
                        </td>
                        {propertyType === 'WEG' && (
                          <td className="p-1">
                            <Input
                              type="number"
                              className="h-8 text-sm"
                              step="0.001"
                              min="0"
                              max="100"
                              value={unit.ownershipShare || ''}
                              onChange={(e) => updateUnit(unit.id, 'ownershipShare', parseFloat(e.target.value) || 0)}
                            />
                          </td>
                        )}
                        {propertyType === 'MV' && (
                          <td className="p-1">
                            <Input
                              type="number"
                              className="h-8 text-sm"
                              min="0"
                              value={unit.rent || ''}
                              onChange={(e) => updateUnit(unit.id, 'rent', parseInt(e.target.value) || 0)}
                            />
                          </td>
                        )}
                        <td className="p-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteUnit(unit.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Unit Button */}
              <div className="flex items-center justify-between pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={addUnit}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Unit to Floor {currentFloor}
                </Button>
                
                {/* Quick summary */}
                <div className="text-sm text-muted-foreground">
                  <span>Floor avg size: {currentFloorUnits.length > 0 ? Math.round(currentFloorUnits.reduce((sum, u) => sum + (u.size || 0), 0) / currentFloorUnits.length) : 0}m²</span>
                  {propertyType === 'MV' && (
                    <span className="ml-4">Total rent: €{currentFloorUnits.reduce((sum, u) => sum + (u.rent || 0), 0)}</span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default UnitsStep