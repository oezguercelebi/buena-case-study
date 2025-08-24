'use client'

import React, { useState, useEffect } from 'react'
import { Building, Home, ChevronLeft, ChevronRight, X, Plus, Info } from 'lucide-react'
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
  
  // Initialize with first building if available
  const initialBuildingId = buildings.length > 0 && buildings[0]?.id ? buildings[0].id : ''
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(initialBuildingId)
  
  console.log('UnitsStep - Buildings:', buildings.map(b => ({ id: b.id, address: b.address })))
  console.log('UnitsStep - Selected building ID:', selectedBuildingId, 'Initial:', initialBuildingId)
  
  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId) || buildings[0]
  const [currentFloor, setCurrentFloor] = useState(selectedBuilding?.startingFloor ?? 0)
  
  // Update selected building if buildings change and current selection is invalid
  useEffect(() => {
    if (selectedBuildingId && !buildings.find(b => b.id === selectedBuildingId)) {
      // Current selection no longer exists, select first building
      if (buildings.length > 0 && buildings[0]?.id) {
        setSelectedBuildingId(buildings[0].id)
        setCurrentFloor(buildings[0].startingFloor ?? 0)
      }
    } else if (!selectedBuildingId && buildings.length > 0 && buildings[0]?.id) {
      // No selection but buildings exist, select first
      setSelectedBuildingId(buildings[0].id)
      setCurrentFloor(buildings[0].startingFloor ?? 0)
    }
  }, [buildings, selectedBuildingId])
  
  // Simple pattern configuration
  const [patternConfig, setPatternConfig] = useState({
    unitsPerFloor: 4,
    baseRent: 12.50, // EUR per m²
  })

  const units = selectedBuilding?.units || []

  // Keyboard navigation for floors
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!selectedBuilding) return
      
      // Arrow keys for floor navigation when not in an input field
      const activeElement = document.activeElement
      const isInputActive = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'SELECT'
      
      if (!isInputActive) {
        const minFloor = selectedBuilding.startingFloor ?? 0
        const maxFloor = minFloor + selectedBuilding.floors - 1
        
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault()
          setCurrentFloor(prev => Math.max(minFloor, prev - 1))
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault()
          setCurrentFloor(prev => Math.min(maxFloor, prev + 1))
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [selectedBuilding])

  const generateUnits = () => {
    if (!selectedBuilding) return

    const generatedUnits: OnboardingUnitData[] = []
    const startingFloor = selectedBuilding.startingFloor ?? 0
    
    for (let floor = startingFloor; floor < startingFloor + selectedBuilding.floors; floor++) {
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

        if (propertyType === 'MV') {
          // Higher rent for higher floors (relative to starting floor)
          const relativeFloor = floor - startingFloor
          const floorMultiplier = 1 + (relativeFloor * 0.02) // 2% increase per floor
          unit.rent = Math.round(unit.size * patternConfig.baseRent * floorMultiplier)
        }

        generatedUnits.push(unit)
      }
    }

    // Update the building with new units
    const updatedBuilding = { ...selectedBuilding, units: generatedUnits }
    let updatedBuildings = buildings.map(b => 
      b.id === selectedBuildingId ? updatedBuilding : b
    )
    
    // For WEG properties, after adding units to this building, recalculate ALL ownership shares
    if (propertyType === 'WEG') {
      const totalUnitsNow = updatedBuildings.reduce((sum, b) => sum + (b.units?.length || 0), 0)
      
      if (totalUnitsNow > 0) {
        const baseShare = Math.floor((100 / totalUnitsNow) * 1000) / 1000
        const remainder = 100 - (baseShare * totalUnitsNow)
        const unitsToAdjust = Math.round(remainder / 0.001)
        
        let globalUnitIndex = 0
        
        // Recalculate shares for ALL units across ALL buildings
        updatedBuildings = updatedBuildings.map(building => ({
          ...building,
          units: building.units?.map(unit => {
            const adjustedShare = globalUnitIndex < unitsToAdjust ? baseShare + 0.001 : baseShare
            globalUnitIndex++
            return {
              ...unit,
              ownershipShare: adjustedShare
            }
          }) || []
        }))
      }
    }
    
    updateData({ buildings: updatedBuildings })
    setCurrentFloor(selectedBuilding.startingFloor ?? 0) // Reset to starting floor
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

    // Group units by floor
    const unitsByFloor: { [key: number]: OnboardingUnitData[] } = {}
    units.forEach(unit => {
      const floor = unit.floor || 0
      if (!unitsByFloor[floor]) unitsByFloor[floor] = []
      unitsByFloor[floor].push(unit)
    })

    // Add new unit to current floor at the end
    if (!unitsByFloor[currentFloor]) unitsByFloor[currentFloor] = []
    unitsByFloor[currentFloor].push(newUnit)

    // Flatten back to array, maintaining floor order
    const updatedUnits = Object.keys(unitsByFloor)
      .sort((a, b) => Number(a) - Number(b))
      .flatMap(floor => unitsByFloor[Number(floor)])

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

      {/* Building Tabs */}
      {buildings.length > 1 && (
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <div className="flex gap-1">
              {buildings.map((building) => {
                const isActive = selectedBuildingId === building.id
                const unitCount = building.units?.length || 0
                
                return (
                  <button
                    key={building.id || `building-${buildings.indexOf(building)}`}
                    className={`relative px-4 py-3 text-sm font-medium transition-all cursor-pointer ${
                      isActive 
                        ? 'text-foreground' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => {
                      setSelectedBuildingId(building.id)
                      setCurrentFloor(building.startingFloor ?? 0)
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <Building className={`h-4 w-4 ${isActive ? 'text-primary' : ''}`} />
                      <span>{building.streetName} {building.houseNumber}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        isActive 
                          ? unitCount > 0 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {unitCount} {unitCount === 1 ? 'unit' : 'units'}
                      </span>
                    </div>
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Building Info - Show for single building or when tabs are not shown */}
      {selectedBuilding && (buildings.length === 1 || !buildings.length) && (
        <Card className="p-4 bg-muted/20 border-muted">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{selectedBuilding.streetName} {selectedBuilding.houseNumber}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedBuilding.floors} floors • {selectedBuilding.buildingType}
                </p>
              </div>
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
                setCurrentFloor(selectedBuilding.startingFloor ?? 0)
              }}
            >
              Regenerate All
            </Button>
          </div>

          {/* Grid Table */}
          <Card className="p-6">
            <div className="space-y-4">

              {/* Floor Navigation */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentFloor(Math.max(selectedBuilding.startingFloor ?? 0, currentFloor - 1))}
                  disabled={currentFloor === (selectedBuilding.startingFloor ?? 0)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous Floor
                </Button>
                
                <div className="text-center">
                  <p className="text-lg font-medium">
                    Floor {currentFloor === 0 ? 'EG' : currentFloor === -1 ? 'UG' : currentFloor}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentFloorUnits.length} units on this floor
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentFloor(Math.min((selectedBuilding.startingFloor ?? 0) + selectedBuilding.floors - 1, currentFloor + 1))}
                  disabled={currentFloor === (selectedBuilding.startingFloor ?? 0) + selectedBuilding.floors - 1}
                >
                  Next Floor
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Floor selector pills */}
              <div className="space-y-3 mb-6">
                <div className="flex gap-1 overflow-x-auto pb-2">
                  {Array.from({ length: selectedBuilding.floors }, (_, i) => (selectedBuilding.startingFloor ?? 0) + i).map(floor => (
                    <button
                      key={floor}
                      onClick={() => setCurrentFloor(floor)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all cursor-pointer ${
                        currentFloor === floor
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {floor === 0 ? 'EG' : floor === -1 ? 'UG' : floor}
                    </button>
                  ))}
                </div>
                
                {/* Subtle keyboard tip */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Info className="h-3 w-3" />
                  <span>Tip: Use arrow keys to navigate floors • Tab to move between fields</span>
                </div>
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
                    <span className="ml-4">Floor total rent: €{currentFloorUnits.reduce((sum, u) => sum + (u.rent || 0), 0)}</span>
                  )}
                </div>
              </div>
              
              {/* Ownership Share Total for WEG properties */}
              {propertyType === 'WEG' && units.length > 0 && (
                <div className="mt-4 p-3 rounded-lg bg-muted/50 border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Ownership Shares:</span>
                    <span className={`text-sm font-bold ${
                      Math.abs(units.reduce((sum, u) => sum + (u.ownershipShare || 0), 0) - 100) <= 0.1 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {units.reduce((sum, u) => sum + (u.ownershipShare || 0), 0).toFixed(3)}%
                    </span>
                  </div>
                  {(() => {
                    const total = units.reduce((sum, u) => sum + (u.ownershipShare || 0), 0);
                    const difference = Math.abs(total - 100);
                    if (difference <= 0.001) {
                      return <p className="text-xs text-green-600 mt-1">✓ Perfect! Shares total exactly 100%</p>;
                    } else if (difference <= 0.1) {
                      return <p className="text-xs text-green-600 mt-1">✓ Within acceptable tolerance (±0.1%)</p>;
                    } else {
                      return <p className="text-xs text-red-600 mt-1">⚠ Must be within 0.1% of 100% (difference: {(total - 100).toFixed(3)}%)</p>;
                    }
                  })()}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default UnitsStep