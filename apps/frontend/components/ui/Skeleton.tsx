'use client'

import React, { memo } from 'react'
import { cn } from '../../lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'default' | 'rounded' | 'circle'
  animation?: 'pulse' | 'wave' | 'none'
  width?: string | number
  height?: string | number
}

export const Skeleton = memo<SkeletonProps>(({
  className,
  variant = 'default',
  animation = 'pulse',
  width,
  height,
  ...props
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700'
  
  const variantClasses = {
    default: 'rounded',
    rounded: 'rounded-lg', 
    circle: 'rounded-full'
  }
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-[shimmer_2s_ease-in-out_infinite]',
    none: ''
  }
  
  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height
  
  return (
    <div 
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
      {...props}
    />
  )
})

Skeleton.displayName = 'Skeleton'

// Pre-built skeleton components for common use cases
export const SkeletonText = memo<{ lines?: number; className?: string }>(({ lines = 1, className }) => (
  <div className={className}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i}
        className={cn(
          'h-4 mb-2 last:mb-0',
          i === lines - 1 ? 'w-3/4' : 'w-full' // Last line shorter
        )}
      />
    ))}
  </div>
))

SkeletonText.displayName = 'SkeletonText'

export const SkeletonCard = memo<{ className?: string }>(({ className }) => (
  <div className={cn('border rounded-lg p-6 space-y-4', className)}>
    <div className="flex items-center space-x-3">
      <Skeleton variant="circle" width={40} height={40} />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
    <SkeletonText lines={3} />
    <div className="flex space-x-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-16" />
    </div>
  </div>
))

SkeletonCard.displayName = 'SkeletonCard'

export const SkeletonTable = memo<{ 
  rows?: number
  columns?: number
  hasHeader?: boolean
  className?: string 
}>(({ rows = 5, columns = 4, hasHeader = true, className }) => (
  <div className={cn('w-full', className)}>
    {hasHeader && (
      <div className="flex space-x-4 mb-4 pb-2 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
    )}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4 mb-3">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton 
            key={colIndex} 
            className={cn(
              'h-8',
              colIndex === 0 ? 'w-1/4' : 'flex-1'
            )}
          />
        ))}
      </div>
    ))}
  </div>
))

SkeletonTable.displayName = 'SkeletonTable'

export const SkeletonForm = memo<{ fields?: number; className?: string }>(({ fields = 5, className }) => (
  <div className={cn('space-y-6', className)}>
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-1/4" /> {/* Label */}
        <Skeleton className="h-10 w-full" />  {/* Input */}
      </div>
    ))}
    <div className="flex space-x-2 pt-4">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-20" />
    </div>
  </div>
))

SkeletonForm.displayName = 'SkeletonForm'

export default Skeleton