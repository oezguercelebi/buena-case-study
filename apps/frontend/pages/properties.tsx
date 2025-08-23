"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/ui/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Building2, MapPin, Home } from "lucide-react"
import Link from "next/link"

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

const mockProperties: Property[] = [
  {
    id: "1",
    name: "Friedrichstraße 123 WEG",
    type: "WEG",
    propertyNumber: "WEG-2024-001",
    unitCount: 24,
    address: "Friedrichstraße 123, 10117 Berlin",
    lastModified: "2024-01-15",
    status: "active",
  },
  {
    id: "2",
    name: "Potsdamer Platz 45",
    type: "MV",
    propertyNumber: "MV-2024-002",
    unitCount: 60,
    address: "Potsdamer Platz 45, 10785 Berlin",
    lastModified: "2024-01-14",
    status: "active",
  },
  {
    id: "3",
    name: "Alexanderplatz 78 WEG",
    type: "WEG",
    propertyNumber: "WEG-2024-003",
    unitCount: 36,
    address: "Alexanderplatz 78, 10178 Berlin",
    lastModified: "2024-01-10",
    status: "draft",
  },
]

export default function PropertiesPage() {
  const [properties] = useState<Property[]>(mockProperties)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
            <p className="mt-1 text-sm text-gray-600">
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

        <div className="grid gap-4">
          {properties.map((property) => (
            <Card key={property.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {property.name}
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        property.type === "WEG"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {property.type}
                    </span>
                    {property.status === "draft" && (
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                        Draft
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-3 grid grid-cols-3 gap-6 text-sm">
                    <div>
                      <p className="text-gray-500">Property Number</p>
                      <p className="font-medium text-gray-900">{property.propertyNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Units</p>
                      <p className="font-medium text-gray-900">{property.unitCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Last Modified</p>
                      <p className="font-medium text-gray-900">
                        {new Date(property.lastModified).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
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

        {properties.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <Home className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No properties yet
              </h3>
              <p className="mt-2 text-sm text-gray-600">
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