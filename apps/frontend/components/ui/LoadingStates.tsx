'use client'

import React, { memo } from 'react'
import { Loader2, Save, Upload } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Skeleton, SkeletonText, SkeletonTable, SkeletonForm } from './Skeleton'

// Generic loading spinner
export const LoadingSpinner = memo<{
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}>(({ size = 'md', className, text }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  }
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Loader2 className={cn('animate-spin', sizes[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  )
})

LoadingSpinner.displayName = 'LoadingSpinner'

// Onboarding step loading states
export const PropertyStepSkeleton = memo(() => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <Skeleton className="h-8 w-64 mx-auto mb-2" />
      <Skeleton className="h-5 w-80 mx-auto" />
    </div>
    
    <div className="max-w-2xl mx-auto">
      <SkeletonForm fields={6} />
      
      {/* Document upload skeleton */}
      <div className="mt-6 border-2 border-dashed border-gray-300 rounded-lg p-8">
        <div className="text-center space-y-3">
          <Skeleton variant="circle" width={48} height={48} className="mx-auto" />
          <Skeleton className="h-5 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      </div>
    </div>
  </div>
))

PropertyStepSkeleton.displayName = 'PropertyStepSkeleton'

export const BuildingsStepSkeleton = memo(() => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <Skeleton className="h-8 w-56 mx-auto mb-2" />
      <Skeleton className="h-5 w-72 mx-auto" />
    </div>
    
    {Array.from({ length: 2 }).map((_, i) => (
      <div key={i} className="border rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
        <SkeletonForm fields={4} />
      </div>
    ))}
  </div>
))

BuildingsStepSkeleton.displayName = 'BuildingsStepSkeleton'

export const UnitsStepSkeleton = memo<{ unitCount?: number }>(({ unitCount = 20 }) => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <Skeleton className="h-8 w-48 mx-auto mb-2" />
      <Skeleton className="h-5 w-64 mx-auto" />
    </div>
    
    {/* Building tabs skeleton */}
    <div className="mb-6">
      <div className="border-b border-gray-200">
        <div className="flex gap-1">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="px-4 py-3">
              <Skeleton className="h-5 w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
    
    {/* Units table skeleton */}
    <div className="border rounded-lg p-6">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-8 w-24" />
      </div>
      
      {unitCount >= 60 ? (
        // Virtual scrolling skeleton
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <Skeleton className="h-4 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="border rounded h-96 p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex gap-2">
                {Array.from({ length: 6 }).map((_, j) => (
                  <Skeleton key={j} className="h-8 flex-1" />
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Regular table skeleton
        <SkeletonTable rows={Math.min(unitCount, 10)} columns={6} />
      )}
    </div>
  </div>
))

UnitsStepSkeleton.displayName = 'UnitsStepSkeleton'

// Specialized loading states
export const SavingIndicator = memo<{
  isVisible: boolean
  text?: string
  className?: string
}>(({ isVisible, text = 'Saving...', className }) => {
  if (!isVisible) return null
  
  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-md border border-blue-200 text-sm',
      className
    )}>
      <Save className="h-4 w-4 animate-pulse" />
      <span>{text}</span>
    </div>
  )
})

SavingIndicator.displayName = 'SavingIndicator'

export const UploadingIndicator = memo<{
  isVisible: boolean
  progress?: number
  fileName?: string
  className?: string
}>(({ isVisible, progress, fileName, className }) => {
  if (!isVisible) return null
  
  return (
    <div className={cn(
      'flex items-center gap-3 px-4 py-3 bg-green-50 text-green-700 rounded-md border border-green-200',
      className
    )}>
      <Upload className="h-5 w-5 animate-bounce" />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">
            {fileName ? `Uploading ${fileName}...` : 'Uploading...'}
          </span>
          {progress !== undefined && (
            <span className="text-xs">{progress}%</span>
          )}
        </div>
        {progress !== undefined && (
          <div className="w-full bg-green-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
})

UploadingIndicator.displayName = 'UploadingIndicator'

// Page-level loading overlay
export const LoadingOverlay = memo<{
  isVisible: boolean
  message?: string
  className?: string
}>(({ isVisible, message = 'Loading...', className }) => {
  if (!isVisible) return null
  
  return (
    <div className={cn(
      'fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50',
      className
    )}>
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <div>
            <h3 className="font-medium text-gray-900">{message}</h3>
            <p className="text-sm text-gray-500 mt-1">Please wait...</p>
          </div>
        </div>
      </div>
    </div>
  )
})

LoadingOverlay.displayName = 'LoadingOverlay'

// Smart loading component that shows different states based on duration
export const SmartLoader = memo<{
  isLoading: boolean
  duration?: number
  fastMessage?: string
  slowMessage?: string
  className?: string
}>(({ 
  isLoading, 
  duration = 0, 
  fastMessage = 'Loading...', 
  slowMessage = 'This is taking longer than expected. Please wait...',
  className 
}) => {
  const message = duration > 5000 ? slowMessage : fastMessage
  
  if (!isLoading) return null
  
  return (
    <div className={cn('flex items-center justify-center p-8', className)}>
      <div className="text-center space-y-3">
        <LoadingSpinner size="lg" />
        <p className={cn(
          'text-sm',
          duration > 5000 ? 'text-orange-600' : 'text-gray-500'
        )}>
          {message}
        </p>
      </div>
    </div>
  )
})

SmartLoader.displayName = 'SmartLoader'

export default LoadingSpinner