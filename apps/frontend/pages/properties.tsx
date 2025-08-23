"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/ui/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Building2, MapPin, Home, Loader2 } from "lucide-react"
import Link from "next/link"
import { api } from "@/utils/api"

type PropertyType = "WEG" | "MV"

interface Property {
  id: string
  name: string
  type: PropertyType
  propertyNumber: string
  unitCount: number
  address: string
  lastModified: string
  status: "draft" | "active" | "archived"
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const data = await api.get<Property[]>('/property')
      setProperties(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching properties:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Properties</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your WEG and MV properties
            </p>
          </div>
          <Link href="/onboarding">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Property
            </Button>
          </Link>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <Card className="p-6 bg-destructive/10 border-destructive/20">
            <p className="text-destructive">{error}</p>
            <Button 
              onClick={fetchProperties} 
              variant="outline" 
              className="mt-4"
              size="sm"
            >
              Try Again
            </Button>
          </Card>
        )}

        {!loading && !error && (
          <div className="grid gap-4">
            {properties.map((property) => (
            <Card key={property.id} className="p-6 hover:shadow-lg transition-shadow bg-card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold text-card-foreground">
                      {property.name}
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        property.type === "WEG"
                          ? "bg-primary/10 text-primary"
                          : "bg-accent text-accent-foreground"
                      }`}
                    >
                      {property.type}
                    </span>
                    {property.status === "draft" && (
                      <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                        Draft
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-3 grid grid-cols-3 gap-6 text-sm">
                    <div>
                      <p className="text-muted-foreground">Property Number</p>
                      <p className="font-medium text-card-foreground">{property.propertyNumber}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Units</p>
                      <p className="font-medium text-card-foreground">{property.unitCount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Modified</p>
                      <p className="font-medium text-card-foreground">
                        {new Date(property.lastModified).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {property.address}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            </Card>
            ))}
          </div>
        )}

        {!loading && !error && properties.length === 0 && (
          <Card className="p-12 bg-card">
            <div className="text-center">
              <Home className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium text-card-foreground">
                No properties yet
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Get started by creating your first property.
              </p>
              <Link href="/onboarding">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Property
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}