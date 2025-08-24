import React, { useState, useEffect } from 'react'
import { AlertCircle, ArrowRight } from 'lucide-react'
import { Button } from '../../ui/button'
import { Card } from '../../ui/card'

interface TypeMappingModalProps {
  open: boolean
  uniqueValues: string[]
  onApplyMapping: (mapping: Record<string, string>) => void
  onCancel: () => void
}

const VALID_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'office', label: 'Office' },
  { value: 'parking', label: 'Parking' },
  { value: 'storage', label: 'Storage' },
  { value: 'commercial', label: 'Commercial' },
]

export const TypeMappingModal: React.FC<TypeMappingModalProps> = ({
  open,
  uniqueValues,
  onApplyMapping,
  onCancel,
}) => {
  const [mapping, setMapping] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open && uniqueValues.length > 0) {
      // Auto-map obvious values
      const autoMapping: Record<string, string> = {}
      uniqueValues.forEach(value => {
        const lower = value.toLowerCase().trim()
        
        // Check if it's already a valid type
        if (VALID_TYPES.some(t => t.value === lower)) {
          autoMapping[value] = lower
        }
        // Try to auto-detect based on common patterns
        else if (lower.includes('wohnung') || lower.includes('apt') || lower.includes('apartment')) {
          autoMapping[value] = 'apartment'
        } else if (lower.includes('büro') || lower.includes('office')) {
          autoMapping[value] = 'office'
        } else if (lower.includes('park') || lower.includes('stellplatz') || lower.includes('garage')) {
          autoMapping[value] = 'parking'
        } else if (lower.includes('lager') || lower.includes('keller') || lower.includes('storage') || lower.includes('abstellraum')) {
          autoMapping[value] = 'storage'
        } else if (lower.includes('gewerbe') || lower.includes('laden') || lower.includes('commercial') || lower.includes('shop')) {
          autoMapping[value] = 'commercial'
        } else {
          // Default to apartment for unknown types
          autoMapping[value] = 'apartment'
        }
      })
      setMapping(autoMapping)
    }
  }, [open, uniqueValues])

  if (!open) return null

  const handleMappingChange = (originalValue: string, newType: string) => {
    setMapping(prev => ({ ...prev, [originalValue]: newType }))
  }

  const handleApply = () => {
    onApplyMapping(mapping)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <Card className="max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h2 className="text-lg font-semibold">Map Unit Types</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Map the CSV values to valid unit types. We've auto-detected some mappings for you.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Found {uniqueValues.length} unique type{uniqueValues.length !== 1 ? 's' : ''} in your CSV:
            </div>
            
            {uniqueValues.map((value) => (
              <div key={value} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{value || '(empty)'}</p>
                  <p className="text-xs text-muted-foreground">Original value from CSV</p>
                </div>
                
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                
                <div className="flex gap-2">
                  {VALID_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handleMappingChange(value, type.value)}
                      className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                        mapping[value] === type.value
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            All values will be mapped to valid unit types
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleApply}>
              Apply Mapping
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}