import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '../../lib/utils'
import { PROGRESS_UTILS } from '../../types/property'

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

// Enhanced Progress with labels for property completion
interface PropertyProgressProps {
  percentage?: number
  showLabel?: boolean
  showPercentage?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const PropertyProgress = ({ 
  percentage = 0, 
  showLabel = false, 
  showPercentage = true, 
  size = 'md',
  className = '' 
}: PropertyProgressProps) => {
  const progressLabel = PROGRESS_UTILS.getProgressLabel(percentage)
  const formattedPercentage = PROGRESS_UTILS.formatPercentage(percentage)
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }
  
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  const getProgressColor = () => {
    if (!percentage || percentage === 0) return 'bg-slate-300'
    if (percentage === 100) return 'bg-green-500'
    return 'bg-blue-500'
  }

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {(showLabel || showPercentage) && (
        <div className="flex items-center justify-between">
          {showLabel && (
            <span className={cn('font-medium text-slate-700', textSizeClasses[size])}>
              {progressLabel}
            </span>
          )}
          {showPercentage && (
            <span className={cn('font-medium text-slate-600', textSizeClasses[size])}>
              {formattedPercentage}
            </span>
          )}
        </div>
      )}
      
      <div className={cn('w-full bg-slate-200 rounded-full overflow-hidden', sizeClasses[size])}>
        <div
          className={cn(getProgressColor(), sizeClasses[size], 'rounded-full transition-all duration-300 ease-in-out')}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// Progress badge for compact display
interface ProgressBadgeProps {
  percentage?: number
  compact?: boolean
  className?: string
}

const ProgressBadge = ({ percentage = 0, compact = false, className = '' }: ProgressBadgeProps) => {
  const status = PROGRESS_UTILS.getProgressStatus(percentage)
  const label = PROGRESS_UTILS.getProgressLabel(percentage)
  const formattedPercentage = PROGRESS_UTILS.formatPercentage(percentage)
  
  const statusColors = {
    'completed': 'bg-green-50 text-green-700 ring-green-600/20',
    'in-progress': 'bg-blue-50 text-blue-700 ring-blue-600/20',
    'not-started': 'bg-slate-50 text-slate-700 ring-slate-600/20'
  }
  
  return (
    <span className={cn(
      'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset',
      statusColors[status],
      className
    )}>
      {compact ? formattedPercentage : `${label} (${formattedPercentage})`}
    </span>
  )
}

export { Progress, PropertyProgress, ProgressBadge }