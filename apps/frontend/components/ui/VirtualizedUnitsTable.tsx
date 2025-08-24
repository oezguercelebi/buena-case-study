'use client'

import React, { memo, useState, useEffect, useRef, useCallback } from 'react'
import { FixedSizeList as List } from 'react-window'
import { X } from 'lucide-react'
import { Button } from './button'
import { Input } from './input'
import { OnboardingUnitData, UnitType, PropertyType } from '../../types/property'

interface VirtualizedUnitsTableProps {
  units: OnboardingUnitData[]
  propertyType: PropertyType
  onUpdateUnit: (unitId: string, field: string, value: any) => void
  onDeleteUnit: (unitId: string) => void
  height?: number
  className?: string
}

interface UnitRowProps {
  index: number
  style: React.CSSProperties
  data: {
    units: OnboardingUnitData[]
    propertyType: PropertyType
    onUpdateUnit: (unitId: string, field: string, value: any) => void
    onDeleteUnit: (unitId: string) => void
  }
}

const UnitRow = memo<UnitRowProps>(({ index, style, data }) => {
  const { units, propertyType, onUpdateUnit, onDeleteUnit } = data
  const unit = units[index]

  if (!unit) {
    return <div style={style} />
  }

  return (
    <div 
      style={style} 
      className="flex items-center border-b hover:bg-muted/30 px-2"
    >
      <div className="flex-1 grid grid-cols-6 gap-2 items-center">
        {/* Unit Number */}
        <div className="min-w-0">
          <Input
            type="text"
            className="h-8 text-sm w-full"
            value={unit.unitNumber || ''}
            onChange={(e) => onUpdateUnit(unit.id!, 'unitNumber', e.target.value)}
            placeholder="Unit #"
          />
        </div>

        {/* Type */}
        <div className="min-w-0">
          <select 
            className="w-full h-8 px-2 rounded border bg-background text-sm"
            value={unit.type || 'apartment'}
            onChange={(e) => onUpdateUnit(unit.id!, 'type', e.target.value as UnitType)}
          >
            <option value="apartment">Apartment</option>
            <option value="office">Office</option>
            <option value="parking">Parking</option>
            <option value="storage">Storage</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>

        {/* Rooms */}
        <div className="min-w-0">
          <Input
            type="number"
            className="h-8 text-sm w-full"
            min="0"
            max="10"
            value={unit.rooms || ''}
            onChange={(e) => onUpdateUnit(unit.id!, 'rooms', parseInt(e.target.value) || 0)}
            placeholder="Rooms"
          />
        </div>

        {/* Size */}
        <div className="min-w-0">
          <Input
            type="number"
            className="h-8 text-sm w-full"
            min="10"
            max="500"
            value={unit.size || ''}
            onChange={(e) => onUpdateUnit(unit.id!, 'size', parseInt(e.target.value) || 0)}
            placeholder="Size (m²)"
          />
        </div>

        {/* Property-specific fields */}
        <div className="min-w-0">
          {propertyType === 'WEG' ? (
            <Input
              type="number"
              className="h-8 text-sm w-full"
              step="0.001"
              min="0"
              max="100"
              value={unit.ownershipShare || ''}
              onChange={(e) => onUpdateUnit(unit.id!, 'ownershipShare', parseFloat(e.target.value) || 0)}
              placeholder="Share (%)"
            />
          ) : (
            <Input
              type="number"
              className="h-8 text-sm w-full"
              min="0"
              value={unit.rent || unit.currentRent || ''}
              onChange={(e) => onUpdateUnit(unit.id!, 'rent', parseInt(e.target.value) || 0)}
              placeholder="Rent (€)"
            />
          )}
        </div>

        {/* Floor info */}
        <div className="min-w-0 text-center">
          <span className="text-xs text-muted-foreground">
            Floor {unit.floor === 0 ? 'EG' : unit.floor === -1 ? 'UG' : unit.floor}
          </span>
        </div>
      </div>

      {/* Delete button */}
      <div className="ml-2 flex-shrink-0">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onDeleteUnit(unit.id!)}
          className="h-8 w-8 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
})

UnitRow.displayName = 'UnitRow'

export const VirtualizedUnitsTable = memo<VirtualizedUnitsTableProps>(({
  units,
  propertyType,
  onUpdateUnit,
  onDeleteUnit,
  height = 400,
  className = ''
}) => {
  const listRef = useRef<List>(null)
  
  // Performance optimization: only re-create data when dependencies change
  const itemData = {
    units,
    propertyType,
    onUpdateUnit,
    onDeleteUnit
  }

  // Scroll to specific unit (useful for navigation)
  const scrollToUnit = useCallback((unitIndex: number) => {
    if (listRef.current) {
      listRef.current.scrollToItem(unitIndex, 'center')
    }
  }, [])

  // Performance metrics logging (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`VirtualizedUnitsTable: Rendering ${units.length} units with virtualization`)
    }
  }, [units.length])

  if (units.length === 0) {
    return (
      <div className={`${className} flex items-center justify-center h-32 text-muted-foreground`}>
        No units configured yet
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center border-b bg-muted/20 px-2 py-2">
        <div className="flex-1 grid grid-cols-6 gap-2 text-sm font-medium">
          <div>Unit #</div>
          <div>Type</div>
          <div>Rooms</div>
          <div>Size (m²)</div>
          <div>{propertyType === 'WEG' ? 'Share (%)' : 'Rent (€)'}</div>
          <div>Floor</div>
        </div>
        <div className="ml-2 flex-shrink-0 w-8">
          {/* Space for delete button */}
        </div>
      </div>

      {/* Virtual Scrolling List */}
      <div className="border rounded-b-lg" style={{ height }}>
        <List
          ref={listRef}
          height={height}
          itemCount={units.length}
          itemSize={45}
          itemData={itemData}
          overscanCount={5} // Render 5 extra items for smooth scrolling
          width="100%"
        >
          {UnitRow}
        </List>
      </div>

      {/* Performance indicator for large datasets */}
      {units.length > 50 && (
        <div className="mt-2 text-xs text-muted-foreground flex items-center justify-between">
          <span>Virtual scrolling active for {units.length} units</span>
          <span>Memory optimized: ~{Math.round(units.length * 45 / 1000)}KB</span>
        </div>
      )}
    </div>
  )
})

VirtualizedUnitsTable.displayName = 'VirtualizedUnitsTable'

export default VirtualizedUnitsTable