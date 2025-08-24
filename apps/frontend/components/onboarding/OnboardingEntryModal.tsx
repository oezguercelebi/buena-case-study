'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Plus, Building2, ArrowRight, Loader2 } from 'lucide-react'
import { PropertyProgress } from '../ui/progress'

interface IncompleteProperty {
  id: string
  name: string
  type: 'WEG' | 'MV'
  unitCount: number
  completionPercentage: number
  lastModified: string
  address?: string
}

interface OnboardingEntryModalProps {
  open: boolean
  incompleteProperties: IncompleteProperty[]
  loading?: boolean
  onCreateNew: () => void
  onContinueProperty: (propertyId: string) => void
}

export const OnboardingEntryModal: React.FC<OnboardingEntryModalProps> = ({
  open,
  incompleteProperties,
  loading = false,
  onCreateNew,
  onContinueProperty,
}) => {
  return (
    <Dialog open={open} onOpenChange={() => {}} modal={true}>
      <DialogContent 
        className="max-w-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        hideCloseButton
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to Property Onboarding</DialogTitle>
          <DialogDescription className="mt-2">
            Choose how you'd like to proceed with your property management
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          {/* Create New Property Option */}
          <Card 
            className="p-6 cursor-pointer hover:shadow-lg transition-all hover:border-primary"
            onClick={onCreateNew}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Create New Property</h3>
                <p className="text-sm text-muted-foreground">
                  Start fresh with a new property registration
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground mt-1" />
            </div>
          </Card>

          {/* Incomplete Properties Section */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : incompleteProperties.length > 0 ? (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with incomplete property
                  </span>
                </div>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {incompleteProperties.map((property) => (
                  <Card
                    key={property.id}
                    className="p-4 cursor-pointer hover:shadow-md transition-all hover:border-primary"
                    onClick={() => onContinueProperty(property.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">{property.name}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            property.type === 'WEG' 
                              ? 'bg-primary/10 text-primary' 
                              : 'bg-accent text-accent-foreground'
                          }`}>
                            {property.type}
                          </span>
                        </div>
                        {property.address && (
                          <p className="text-xs text-muted-foreground truncate mb-2">
                            {property.address}
                          </p>
                        )}
                        <div className="space-y-1">
                          <PropertyProgress 
                            percentage={property.completionPercentage} 
                            size="sm"
                            showLabel
                          />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{property.unitCount} units</span>
                            <span>Last modified: {new Date(property.lastModified).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}