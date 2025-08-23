'use client'

import React, { useState } from 'react'
import { Building, X, Plus, Sparkles, Calculator, CheckCircle, Home } from 'lucide-react'
import { Card } from '../../ui/card'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { Select } from '../../ui/select'
import type { Building as BuildingType, Unit, UnitType, ShareDistributionMethod } from '../../../types/property'

interface UnitsStepProps {
  buildings?: BuildingType[]
  propertyType?: 'WEG' | 'MV'
  onUnitsChange?: (units: Unit[]) => void
}

type UnitEntryMode = 'pattern' | 'bulk' | 'grid'

const UnitsStep: React.FC<UnitsStepProps> = ({ 
  buildings = [], 
  propertyType = 'WEG', 
  onUnitsChange 
}) => {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(buildings[0]?.id || '')
  const [unitEntryMode, setUnitEntryMode] = useState<UnitEntryMode>('pattern')
  const [shareDistribution, setShareDistribution] = useState<ShareDistributionMethod>('equal')
  const [units, setUnits] = useState<Unit[]>([])
  
  // Pattern mode state
  const [patternConfig, setPatternConfig] = useState({
    unitsPerFloor: 4,
    patternType: 'same',
    baseRent: 12.50,
    floorAdjustment: 2
  })

  // Grid mode state
  const [gridUnits, setGridUnits] = useState<Unit[]>([])

  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId)

  const handleApplyPattern = () => {
    if (!selectedBuilding) return

    const generatedUnits: Unit[] = []
    
    for (let floor = 1; floor <= selectedBuilding.floors; floor++) {
      for (let unitNum = 1; unitNum <= patternConfig.unitsPerFloor; unitNum++) {
        const unit: Unit = {
          id: `${selectedBuildingId}-${floor}-${unitNum}`,
          buildingId: selectedBuildingId,
          unitNumber: `${floor}.${unitNum.toString().padStart(2, '0')}`,
          floor,
          type: 'apartment',
          rooms: unitNum <= 2 ? 2 : 3,
          size: unitNum <= 2 ? 65 : 85,
        }

        if (propertyType === 'WEG') {
          // Calculate ownership share based on distribution method
          if (shareDistribution === 'equal') {
            unit.ownershipShare = 100 / (selectedBuilding.floors * patternConfig.unitsPerFloor)
          } else if (shareDistribution === 'size') {
            // Simplified calculation - in real app would need total area
            unit.ownershipShare = (unit.size / (selectedBuilding.floors * patternConfig.unitsPerFloor * 75)) * 100
          }
        } else if (propertyType === 'MV') {
          // Calculate rent with floor adjustment
          const floorMultiplier = 1 + ((floor - 1) * patternConfig.floorAdjustment / 100)
          unit.rent = Math.round(unit.size * patternConfig.baseRent * floorMultiplier)
        }

        generatedUnits.push(unit)
      }
    }

    setUnits(generatedUnits)
    if (onUnitsChange) {
      onUnitsChange(generatedUnits)
    }
  }

  const handleAddBulkUnits = (type: string, rooms: number, size: number, quantity: number) => {
    if (!selectedBuilding) return

    const newUnits: Unit[] = []
    const startIndex = units.length

    for (let i = 0; i < quantity; i++) {
      const floor = Math.floor(startIndex + i / 4) + 1
      const unitNum = (startIndex + i) % 4 + 1
      
      const unit: Unit = {
        id: `${selectedBuildingId}-bulk-${Date.now()}-${i}`,
        buildingId: selectedBuildingId,
        unitNumber: `${floor}.${unitNum.toString().padStart(2, '0')}`,
        floor,
        type: type as UnitType,
        rooms,
        size,
      }

      if (propertyType === 'WEG') {
        unit.ownershipShare = 100 / (selectedBuilding.floors * selectedBuilding.unitsPerFloor)
      } else if (propertyType === 'MV') {
        unit.rent = Math.round(size * patternConfig.baseRent)
      }

      newUnits.push(unit)
    }

    const updatedUnits = [...units, ...newUnits]
    setUnits(updatedUnits)
    if (onUnitsChange) {
      onUnitsChange(updatedUnits)
    }
  }

  const unitTemplates = [
    { type: 'Studio', rooms: 1, size: '25-40', icon: '🏠', typical: 'Student/Single' },
    { type: '2-Room', rooms: 2, size: '45-65', icon: '🏡', typical: 'Couple/Single' },
    { type: '3-Room', rooms: 3, size: '70-95', icon: '🏘️', typical: 'Small Family' },
    { type: '4-Room', rooms: 4, size: '95-120', icon: '🏛️', typical: 'Family' },
    { type: '5+ Room', rooms: 5, size: '120+', icon: '🏰', typical: 'Large Family' },
    { type: 'Commercial', rooms: 0, size: 'Variable', icon: '🏢', typical: 'Office/Shop' },
  ]

  const shareDistributionMethods: { id: ShareDistributionMethod; label: string; desc: string }[] = [
    { id: 'equal', label: 'Equal Shares', desc: '100% ÷ units' },
    { id: 'size', label: 'By Size', desc: 'Proportional to m²' },
    { id: 'rooms', label: 'By Rooms', desc: 'Based on room count' },
    { id: 'custom', label: 'Custom', desc: 'Manual entry' },
  ]

  // Initialize grid units for grid mode
  React.useEffect(() => {
    if (unitEntryMode === 'grid' && gridUnits.length === 0 && selectedBuilding) {
      const initialGridUnits: Unit[] = []
      for (let i = 0; i < 8; i++) {
        const floor = Math.floor(i / 4) + 1
        const unitNum = (i % 4) + 1
        initialGridUnits.push({
          id: `grid-${i}`,
          buildingId: selectedBuildingId,
          unitNumber: `${floor}.${unitNum.toString().padStart(2, '0')}`,
          floor,
          type: 'apartment',
          rooms: i % 4 < 2 ? 2 : 3,
          size: i % 4 < 2 ? 65 : 85,
          ownershipShare: propertyType === 'WEG' ? 4.167 : undefined,
          rent: propertyType === 'MV' ? 1200 : undefined
        })
      }
      setGridUnits(initialGridUnits)
    }
  }, [unitEntryMode, gridUnits.length, selectedBuilding, selectedBuildingId, propertyType])

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
      {/* Building Tabs if multiple buildings */}
      {buildings.length > 1 && (
        <div className="flex items-center p-1 bg-muted rounded-lg overflow-x-auto">
          {buildings.map((building) => (
            <button
              key={building.id}
              className={`flex-1 px-4 py-2 rounded text-sm font-medium whitespace-nowrap transition-all ${
                selectedBuildingId === building.id 
                  ? 'bg-background shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setSelectedBuildingId(building.id)}
            >
              <span className="flex items-center justify-center gap-2">
                <Building className="h-3 w-3" />
                {building.streetName} {building.houseNumber}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Configure Units</h2>
          {selectedBuilding && (
            <p className="text-sm text-muted-foreground">
              Add units for {selectedBuilding.streetName} {selectedBuilding.houseNumber} • 
              {selectedBuilding.floors} floors • ~{selectedBuilding.floors * selectedBuilding.unitsPerFloor} units expected
            </p>
          )}
        </div>
        
        {/* Entry Mode Toggle */}
        <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
          <button
            className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
              unitEntryMode === 'pattern' 
                ? 'bg-background shadow-sm' 
                : 'text-muted-foreground'
            }`}
            onClick={() => setUnitEntryMode('pattern')}
          >
            Pattern Mode
          </button>
          <button
            className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
              unitEntryMode === 'bulk' 
                ? 'bg-background shadow-sm' 
                : 'text-muted-foreground'
            }`}
            onClick={() => setUnitEntryMode('bulk')}
          >
            Bulk Entry
          </button>
          <button
            className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
              unitEntryMode === 'grid' 
                ? 'bg-background shadow-sm' 
                : 'text-muted-foreground'
            }`}
            onClick={() => setUnitEntryMode('grid')}
          >
            Grid Mode
          </button>
        </div>
      </div>

      {/* Pattern Recognition Mode */}
      {unitEntryMode === 'pattern' && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Pattern Detection</h3>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Define a pattern and we'll auto-generate units for all floors
            </p>
            
            {/* Pattern Template */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Units per Floor</Label>
                <Input
                  type="number"
                  placeholder="e.g., 4"
                  value={patternConfig.unitsPerFloor}
                  onChange={(e) => setPatternConfig({
                    ...patternConfig,
                    unitsPerFloor: parseInt(e.target.value) || 1
                  })}
                  min="1"
                  max="20"
                />
              </div>
              <div className="space-y-2">
                <Label>Pattern Type</Label>
                <select 
                  className="w-full h-9 px-3 rounded-md border bg-background"
                  value={patternConfig.patternType}
                  onChange={(e) => setPatternConfig({
                    ...patternConfig,
                    patternType: e.target.value
                  })}
                >
                  <option value="same">Same layout all floors</option>
                  <option value="decreasing">Decreasing size on upper floors</option>
                  <option value="different-ground">Different ground floor</option>
                  <option value="custom">Custom per floor</option>
                </select>
              </div>
            </div>
            
            {/* Unit Template Configuration */}
            <div className="border rounded-lg p-4 bg-muted/30">
              <p className="text-sm font-medium mb-3">Configure Template Units (Floor 1)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Array.from({ length: patternConfig.unitsPerFloor }, (_, i) => i + 1).map((unit) => (
                  <div key={unit} className="flex items-center gap-3 p-3 bg-background rounded-md">
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <Input
                        type="text"
                        className="h-8 text-sm"
                        placeholder="Unit"
                        defaultValue={`1.${unit.toString().padStart(2, '0')}`}
                      />
                      <Input
                        type="number"
                        className="h-8 text-sm"
                        placeholder="Rooms"
                        defaultValue={unit <= 2 ? "2" : "3"}
                      />
                      <Input
                        type="number"
                        className="h-8 text-sm"
                        placeholder="m²"
                        defaultValue={unit <= 2 ? "65" : "85"}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Apply Pattern Button */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                This will generate {selectedBuilding ? selectedBuilding.floors * patternConfig.unitsPerFloor : 0} units 
                across {selectedBuilding?.floors || 0} floors
              </p>
              <Button onClick={handleApplyPattern}>
                <Sparkles className="h-4 w-4 mr-2" />
                Apply Pattern
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Bulk Entry Mode */}
      {unitEntryMode === 'bulk' && (
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="font-medium mb-4">Quick Add Templates</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select unit types to add multiple units at once
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {unitTemplates.map((template) => (
                <button
                  key={template.type}
                  className="p-4 border rounded-lg text-left hover:bg-muted transition-all"
                  onClick={() => {
                    const avgSize = template.size.includes('-') 
                      ? parseInt(template.size.split('-')[1]) 
                      : template.size === 'Variable' ? 100 : parseInt(template.size.replace('+', ''))
                    handleAddBulkUnits(
                      template.type.toLowerCase().replace(' ', '-'),
                      template.rooms,
                      avgSize,
                      1
                    )
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl">{template.icon}</span>
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {template.rooms > 0 ? `${template.rooms} Room${template.rooms > 1 ? 's' : ''}` : 'N/A'}
                    </span>
                  </div>
                  <p className="font-medium text-sm">{template.type}</p>
                  <p className="text-xs text-muted-foreground">{template.size} m²</p>
                  <p className="text-xs text-muted-foreground mt-1">{template.typical}</p>
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Grid Entry Mode */}
      {unitEntryMode === 'grid' && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Grid Entry Mode</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <kbd className="px-1.5 py-0.5 bg-muted rounded">Tab</kbd>
                <span>Navigate</span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded">Ctrl+D</kbd>
                <span>Duplicate down</span>
              </div>
            </div>
            
            {/* Grid Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 text-sm font-medium">Unit #</th>
                    <th className="text-left p-2 text-sm font-medium">Floor</th>
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
                  {gridUnits.map((unit, index) => (
                    <tr key={unit.id} className="border-b hover:bg-muted/30">
                      <td className="p-1">
                        <Input
                          type="text"
                          className="h-8 text-sm"
                          value={unit.unitNumber}
                          onChange={(e) => {
                            const updated = [...gridUnits]
                            updated[index].unitNumber = e.target.value
                            setGridUnits(updated)
                          }}
                        />
                      </td>
                      <td className="p-1">
                        <Input
                          type="number"
                          className="h-8 text-sm"
                          value={unit.floor}
                          onChange={(e) => {
                            const updated = [...gridUnits]
                            updated[index].floor = parseInt(e.target.value) || 1
                            setGridUnits(updated)
                          }}
                        />
                      </td>
                      <td className="p-1">
                        <select 
                          className="w-full h-8 px-2 rounded border bg-background text-sm"
                          value={unit.type}
                          onChange={(e) => {
                            const updated = [...gridUnits]
                            updated[index].type = e.target.value as UnitType
                            setGridUnits(updated)
                          }}
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
                          value={unit.rooms}
                          onChange={(e) => {
                            const updated = [...gridUnits]
                            updated[index].rooms = parseInt(e.target.value) || 1
                            setGridUnits(updated)
                          }}
                        />
                      </td>
                      <td className="p-1">
                        <Input
                          type="number"
                          className="h-8 text-sm"
                          value={unit.size}
                          onChange={(e) => {
                            const updated = [...gridUnits]
                            updated[index].size = parseInt(e.target.value) || 0
                            setGridUnits(updated)
                          }}
                        />
                      </td>
                      {propertyType === 'WEG' && (
                        <td className="p-1">
                          <Input
                            type="number"
                            className="h-8 text-sm"
                            value={unit.ownershipShare}
                            step="0.001"
                            onChange={(e) => {
                              const updated = [...gridUnits]
                              updated[index].ownershipShare = parseFloat(e.target.value) || 0
                              setGridUnits(updated)
                            }}
                          />
                        </td>
                      )}
                      {propertyType === 'MV' && (
                        <td className="p-1">
                          <Input
                            type="number"
                            className="h-8 text-sm"
                            value={unit.rent}
                            onChange={(e) => {
                              const updated = [...gridUnits]
                              updated[index].rent = parseInt(e.target.value) || 0
                              setGridUnits(updated)
                            }}
                          />
                        </td>
                      )}
                      <td className="p-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const updated = gridUnits.filter((_, i) => i !== index)
                            setGridUnits(updated)
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Add Row Button */}
            <div className="flex items-center justify-between pt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const newUnit: Unit = {
                    id: `grid-${Date.now()}`,
                    buildingId: selectedBuildingId,
                    unitNumber: '',
                    floor: 1,
                    type: 'apartment',
                    rooms: 2,
                    size: 65,
                    ownershipShare: propertyType === 'WEG' ? 4.167 : undefined,
                    rent: propertyType === 'MV' ? 1200 : undefined
                  }
                  setGridUnits([...gridUnits, newUnit])
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Row
              </Button>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm">
                  Import CSV
                </Button>
                <Button variant="outline" size="sm">
                  Copy from Excel
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Smart Distributions Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            {propertyType === 'WEG' ? 'Ownership Share Distribution' : 'Rent Configuration'}
          </h3>
          
          {propertyType === 'WEG' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Choose how to distribute ownership shares across units
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {shareDistributionMethods.map((method) => (
                  <button
                    key={method.id}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      shareDistribution === method.id
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setShareDistribution(method.id)}
                  >
                    <p className="font-medium text-sm">{method.label}</p>
                    <p className="text-xs text-muted-foreground">{method.desc}</p>
                  </button>
                ))}
              </div>
              
              {/* Validation Message */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <p className="text-sm">Total Share Distribution:</p>
                <p className="font-mono font-medium">
                  {units.reduce((sum, u) => sum + (u.ownershipShare || 0), 0).toFixed(3)}%
                </p>
              </div>
            </div>
          )}
          
          {propertyType === 'MV' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Set rent ranges based on market data for Berlin, Neubau properties
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Base Rent per m²</Label>
                  <Input
                    type="number"
                    placeholder="12.50"
                    step="0.50"
                    value={patternConfig.baseRent}
                    onChange={(e) => setPatternConfig({
                      ...patternConfig,
                      baseRent: parseFloat(e.target.value) || 12.50
                    })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Market average: €11-14 per m²
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Floor Adjustment</Label>
                  <Input
                    type="number"
                    placeholder="2"
                    step="1"
                    value={patternConfig.floorAdjustment}
                    onChange={(e) => setPatternConfig({
                      ...patternConfig,
                      floorAdjustment: parseInt(e.target.value) || 0
                    })}
                  />
                  <p className="text-xs text-muted-foreground">
                    % increase per floor (typically 1-3%)
                  </p>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Apply Market Rates to All Units
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Summary */}
      {units.length > 0 && (
        <Card className="p-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">{units.length} units configured</p>
                <p className="text-sm text-muted-foreground">
                  {selectedBuilding?.floors || 0} floors • {propertyType === 'WEG' ? 'Ownership shares distributed' : 'Rent rates applied'}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Review Units
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

export default UnitsStep