'use client'

import React, { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, X, Check } from 'lucide-react'
import { Card } from '../../ui/card'
import { Button } from '../../ui/button'
import { Label } from '../../ui/label'
import { OnboardingUnitData } from '../../../types/property'

interface BulkImportProps {
  buildingId: string
  propertyType: 'WEG' | 'MV'
  onImport: (units: OnboardingUnitData[]) => void
  onClose: () => void
}

interface ParsedRow {
  [key: string]: string | number
}

const availableUnitFields = [
  { id: 'unitNumber', label: 'Unit Number', required: true },
  { id: 'floor', label: 'Floor', required: true, type: 'number' },
  { id: 'type', label: 'Unit Type', required: false },
  { id: 'rooms', label: 'Rooms', required: false, type: 'number' },
  { id: 'size', label: 'Size (m²)', required: true, type: 'number' },
  { id: 'ownershipShare', label: 'Ownership Share (%)', required: false, type: 'number', onlyFor: 'WEG' },
  { id: 'rent', label: 'Rent (€)', required: false, type: 'number', onlyFor: 'MV' },
  { id: 'skip', label: '-- Skip this column --', required: false }
]

export const BulkImport: React.FC<BulkImportProps> = ({
  buildingId,
  propertyType,
  onImport,
  onClose
}) => {
  const [csvData, setCsvData] = useState<ParsedRow[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [fieldMapping, setFieldMapping] = useState<{ [columnIndex: number]: string }>({})
  const [previewData, setPreviewData] = useState<OnboardingUnitData[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      parseCSV(text)
    }
    reader.readAsText(file)
  }

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) {
      alert('CSV file must have at least a header row and one data row')
      return
    }

    // Parse headers
    const headerLine = lines[0]
    const parsedHeaders = headerLine.split(/[,;\t]/).map(h => h.trim().replace(/^["']|["']$/g, ''))
    setHeaders(parsedHeaders)

    // Parse data rows
    const dataRows: ParsedRow[] = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(/[,;\t]/).map(v => v.trim().replace(/^["']|["']$/g, ''))
      const row: ParsedRow = {}
      parsedHeaders.forEach((header, index) => {
        const value = values[index] || ''
        // Try to parse as number if it looks like one
        const numValue = parseFloat(value)
        row[index] = !isNaN(numValue) && value.match(/^\d+\.?\d*$/) ? numValue : value
      })
      dataRows.push(row)
    }

    setCsvData(dataRows)
    
    // Auto-map obvious fields based on common patterns
    const autoMapping: { [key: number]: string } = {}
    parsedHeaders.forEach((header, index) => {
      const lowerHeader = header.toLowerCase()
      if (lowerHeader.includes('unit') || lowerHeader.includes('nummer') || lowerHeader.includes('number')) {
        autoMapping[index] = 'unitNumber'
      } else if (lowerHeader.includes('floor') || lowerHeader.includes('etage') || lowerHeader.includes('geschoss')) {
        autoMapping[index] = 'floor'
      } else if (lowerHeader.includes('room') || lowerHeader.includes('zimmer')) {
        autoMapping[index] = 'rooms'
      } else if (lowerHeader.includes('size') || lowerHeader.includes('größe') || lowerHeader.includes('fläche') || lowerHeader.includes('m²') || lowerHeader.includes('sqm')) {
        autoMapping[index] = 'size'
      } else if (propertyType === 'WEG' && (lowerHeader.includes('share') || lowerHeader.includes('anteil') || lowerHeader.includes('%'))) {
        autoMapping[index] = 'ownershipShare'
      } else if (propertyType === 'MV' && (lowerHeader.includes('rent') || lowerHeader.includes('miete') || lowerHeader.includes('€'))) {
        autoMapping[index] = 'rent'
      }
    })
    
    setFieldMapping(autoMapping)
  }

  const handleMappingChange = (columnIndex: number, field: string) => {
    setFieldMapping(prev => ({
      ...prev,
      [columnIndex]: field === 'skip' ? '' : field
    }))
  }

  const generatePreview = () => {
    const units: OnboardingUnitData[] = []
    
    csvData.forEach((row, rowIndex) => {
      const unit: Partial<OnboardingUnitData> = {
        id: `${buildingId}-import-${Date.now()}-${rowIndex}`,
        buildingId
      }

      Object.entries(fieldMapping).forEach(([colIndex, field]) => {
        if (field && field !== 'skip') {
          const value = row[parseInt(colIndex)]
          const fieldConfig = availableUnitFields.find(f => f.id === field)
          
          if (fieldConfig?.type === 'number') {
            unit[field as keyof OnboardingUnitData] = typeof value === 'number' ? value : parseFloat(value as string) || 0
          } else {
            unit[field as keyof OnboardingUnitData] = value as any
          }
        }
      })

      // Set defaults for required fields if not mapped
      if (!unit.unitNumber) unit.unitNumber = `Unit${rowIndex + 1}`
      if (unit.floor === undefined) unit.floor = 0
      if (!unit.type) unit.type = 'apartment'
      if (!unit.size) unit.size = 75
      if (!unit.rooms) unit.rooms = 2

      // Property type specific defaults
      if (propertyType === 'WEG' && unit.ownershipShare === undefined) {
        unit.ownershipShare = 0
      }
      if (propertyType === 'MV' && unit.rent === undefined) {
        unit.rent = 0
      }

      units.push(unit as OnboardingUnitData)
    })

    setPreviewData(units)
  }

  const handleImport = () => {
    if (previewData.length === 0) {
      generatePreview()
    }
    onImport(previewData)
    onClose()
  }

  const filteredFields = availableUnitFields.filter(field => 
    !field.onlyFor || field.onlyFor === propertyType
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Bulk Import Units</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Upload a CSV file and map columns to unit fields
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* File Upload */}
          {csvData.length === 0 ? (
            <div className="space-y-4">
              <div 
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="font-medium mb-2">Click to upload CSV file</p>
                <p className="text-sm text-muted-foreground">
                  Supports CSV files with comma, semicolon or tab separators
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Expected format:</p>
                <div className="text-xs font-mono bg-background rounded p-2">
                  <div>Unit,Floor,Rooms,Size{propertyType === 'WEG' ? ',Share' : ',Rent'}</div>
                  <div>101,1,2,65{propertyType === 'WEG' ? ',1.5' : ',850'}</div>
                  <div>102,1,3,85{propertyType === 'WEG' ? ',2.0' : ',1100'}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Column Mapping */}
              <div>
                <h3 className="font-medium mb-3">Map CSV columns to unit fields</h3>
                <div className="space-y-3">
                  {headers.map((header, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-48 text-sm">
                        <span className="font-mono bg-muted px-2 py-1 rounded">
                          {header || `Column ${index + 1}`}
                        </span>
                        <div className="text-xs text-muted-foreground mt-1">
                          Sample: {csvData[0]?.[index]?.toString() || 'empty'}
                        </div>
                      </div>
                      <div className="flex-1">
                        <select
                          className="w-full h-9 px-3 rounded-md border bg-background"
                          value={fieldMapping[index] || 'skip'}
                          onChange={(e) => handleMappingChange(index, e.target.value)}
                        >
                          {filteredFields.map(field => (
                            <option key={field.id} value={field.id}>
                              {field.label} {field.required && '*'}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">Preview (first 5 units)</h3>
                  <Button size="sm" onClick={generatePreview}>
                    Update Preview
                  </Button>
                </div>
                <div className="border rounded-lg overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-2">Unit #</th>
                        <th className="text-left p-2">Floor</th>
                        <th className="text-left p-2">Rooms</th>
                        <th className="text-left p-2">Size</th>
                        {propertyType === 'WEG' && <th className="text-left p-2">Share</th>}
                        {propertyType === 'MV' && <th className="text-left p-2">Rent</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {(previewData.length > 0 ? previewData : csvData.map((_, i) => ({} as OnboardingUnitData)))
                        .slice(0, 5)
                        .map((unit, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">{unit.unitNumber || '-'}</td>
                          <td className="p-2">{unit.floor ?? '-'}</td>
                          <td className="p-2">{unit.rooms || '-'}</td>
                          <td className="p-2">{unit.size || '-'}m²</td>
                          {propertyType === 'WEG' && <td className="p-2">{unit.ownershipShare || '-'}%</td>}
                          {propertyType === 'MV' && <td className="p-2">€{unit.rent || '-'}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Total units to import: {csvData.length}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex items-center justify-between">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleImport} 
            disabled={csvData.length === 0}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import {csvData.length} Units
          </Button>
        </div>
      </Card>
    </div>
  )
}