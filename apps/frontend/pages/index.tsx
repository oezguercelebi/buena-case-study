import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/ui/dashboard-layout'
import { Card } from '@/components/ui/card'
import { PropertyProgress } from '@/components/ui/progress'
import { Building2, Home, Package, TrendingUp, CheckCircle, Clock, Circle, Loader2 } from 'lucide-react'
import { api } from '@/utils/api'

interface PropertyStats {
  totalProperties: number
  wegProperties: number
  mvProperties: number
  totalUnits: number
  activeProperties: number
  archivedProperties: number
  averageUnitsPerProperty: number
  completedProperties: number
  inProgressProperties: number
  notStartedProperties: number
  averageCompletionPercentage: number
}

export default function HomePage() {
  const [stats, setStats] = useState<PropertyStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const data = await api.get<PropertyStats>('/property/stats')
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of your property management system
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Properties Card */}
            <Card className="p-6 bg-card hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Properties
                  </p>
                  <p className="text-3xl font-bold text-card-foreground mt-2">
                    {stats?.totalProperties || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {stats?.activeProperties || 0} active
                  </p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
              </div>
            </Card>

            {/* Total Units Card */}
            <Card className="p-6 bg-card hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Units
                  </p>
                  <p className="text-3xl font-bold text-card-foreground mt-2">
                    {stats?.totalUnits || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Avg {stats?.averageUnitsPerProperty || 0} per property
                  </p>
                </div>
                <div className="p-3 bg-accent rounded-full">
                  <Package className="h-6 w-6 text-accent-foreground" />
                </div>
              </div>
            </Card>

            {/* WEG Properties Card */}
            <Card className="p-6 bg-card hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    WEG Properties
                  </p>
                  <p className="text-3xl font-bold text-card-foreground mt-2">
                    {stats?.wegProperties || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Condominium properties
                  </p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <Home className="h-6 w-6 text-primary" />
                </div>
              </div>
            </Card>

            {/* MV Properties Card */}
            <Card className="p-6 bg-card hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    MV Properties
                  </p>
                  <p className="text-3xl font-bold text-card-foreground mt-2">
                    {stats?.mvProperties || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Rental properties
                  </p>
                </div>
                <div className="p-3 bg-accent rounded-full">
                  <TrendingUp className="h-6 w-6 text-accent-foreground" />
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}