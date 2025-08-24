import React, { useState } from 'react'
import { AlertCircle, Check } from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'

interface InvalidUnit {
  buildingIndex: number
  buildingAddress: string
  unitIndex: number
  unitNumber: string
  currentType?: string
}

interface UnitTypeValidationModalProps {
  open: boolean
  invalidUnits: InvalidUnit[]
  onFix: (fixes: Record<string, string>) => void
  onCancel: () => void
}

const VALID_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'office', label: 'Office' },
  { value: 'parking', label: 'Parking' },
  { value: 'storage', label: 'Storage' },
  { value: 'commercial', label: 'Commercial' },
]

export const UnitTypeValidationModal: React.FC<UnitTypeValidationModalProps> = ({
  open,
  invalidUnits,
  onFix,
  onCancel,
}) => {
  const [fixes, setFixes] = useState<Record<string, string>>({})

  if (!open) return null

  const handleTypeChange = (key: string, type: string) => {
    setFixes(prev => ({ ...prev, [key]: type }))
  }

  const handleApplyFixes = () => {
    onFix(fixes)
  }

  const allFixed = invalidUnits.every(unit => {
    const key = `${unit.buildingIndex}-${unit.unitIndex}`
    return fixes[key] && VALID_TYPES.some(t => t.value === fixes[key])
  })

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h2 className="text-lg font-semibold">Fix Unit Types</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Some units have invalid or missing types. Please select valid types before saving.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {invalidUnits.map((unit) => {
              const key = `${unit.buildingIndex}-${unit.unitIndex}`
              const selectedType = fixes[key] || 'apartment'
              
              return (
                <div key={key} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-sm">
                        Unit {unit.unitNumber || `#${unit.unitIndex + 1}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {unit.buildingAddress}
                      </p>
                    </div>
                    {fixes[key] && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {VALID_TYPES.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => handleTypeChange(key, type.value)}
                        className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                          selectedType === type.value
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'hover:bg-muted'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="p-6 border-t flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {invalidUnits.length} unit{invalidUnits.length !== 1 ? 's' : ''} need fixing
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleApplyFixes}
              disabled={!allFixed}
            >
              Apply & Continue
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}