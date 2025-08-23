import { DashboardLayout } from '@/components/ui/dashboard-layout'

export default function Home() {
  return (
    <DashboardLayout>
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Buena
          </h1>
          <p className="text-lg text-gray-600">
            Property Management System
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}