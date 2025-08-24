import * as React from 'react'
import { cn } from '../../lib/utils'
import { Check, X, AlertCircle, Loader2 } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'

const stepsVariants = cva(
  'flex',
  {
    variants: {
      orientation: {
        horizontal: 'flex-row',
        vertical: 'flex-col',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  }
)

export interface Step {
  id: string | number
  label: string
  description?: string
  icon?: React.ReactNode
  status?: 'completed' | 'current' | 'upcoming' | 'error' | 'loading'
}

export interface StepsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stepsVariants> {
  steps: Step[]
  currentStep?: number
  showProgressBar?: boolean
  allowClickableSteps?: boolean
  onStepClick?: (stepIndex: number) => void
  canNavigateToStep?: (stepIndex: number) => boolean
  displayMode?: 'all' | 'icon-only' | 'label-only' | 'icon-label'
}

const Steps = React.forwardRef<HTMLDivElement, StepsProps>(
  ({
    className,
    steps,
    currentStep = 0,
    orientation = 'horizontal',
    showProgressBar = true,
    allowClickableSteps = false,
    onStepClick,
    canNavigateToStep,
    displayMode = 'all',
    ...props
  }, ref) => {
    const [animatedProgress, setAnimatedProgress] = React.useState(0)

    React.useEffect(() => {
      const timer = setTimeout(() => {
        const progress = ((currentStep) / (steps.length - 1)) * 100
        setAnimatedProgress(Math.min(progress, 100))
      }, 100)
      return () => clearTimeout(timer)
    }, [currentStep, steps.length])

    const getStepStatus = (index: number, step: Step): Step['status'] => {
      if (step.status) return step.status
      if (index < currentStep) return 'completed'
      if (index === currentStep) return 'current'
      return 'upcoming'
    }

    const getStepIcon = (status: Step['status'], icon?: React.ReactNode) => {
      switch (status) {
        case 'completed':
          return icon || <Check className="h-4 w-4" />
        case 'error':
          return <X className="h-4 w-4" />
        case 'loading':
          return <Loader2 className="h-4 w-4 animate-spin" />
        case 'current':
          return icon || <div className="w-2 h-2 bg-current rounded-full" />
        default:
          return icon || <div className="w-2 h-2 bg-current rounded-full opacity-40" />
      }
    }

    const getStepColors = (status: Step['status']) => {
      switch (status) {
        case 'completed':
          return {
            bg: 'bg-primary',
            text: 'text-primary-foreground',
            border: 'border-primary',
            labelText: 'text-foreground',
          }
        case 'current':
          return {
            bg: 'bg-primary',
            text: 'text-primary-foreground',
            border: 'border-primary',
            labelText: 'text-foreground font-semibold',
          }
        case 'error':
          return {
            bg: 'bg-destructive',
            text: 'text-destructive-foreground',
            border: 'border-destructive',
            labelText: 'text-destructive',
          }
        case 'loading':
          return {
            bg: 'bg-primary/80',
            text: 'text-primary-foreground',
            border: 'border-primary',
            labelText: 'text-foreground',
          }
        default:
          return {
            bg: 'bg-muted',
            text: 'text-muted-foreground',
            border: 'border-muted-foreground/30',
            labelText: 'text-muted-foreground',
          }
      }
    }

    const isHorizontal = orientation === 'horizontal'

    // Calculate the position of the progress line
    const getProgressLineStyles = () => {
      if (isHorizontal) {
        const stepWidth = 100 / steps.length
        const progressStart = stepWidth / 2
        const progressEnd = 100 - (stepWidth / 2)
        const progressWidth = progressEnd - progressStart
        
        return {
          container: {
            left: `${progressStart}%`,
            right: `${100 - progressEnd}%`,
            width: `${progressWidth}%`,
          }
        }
      }
      return {}
    }

    const lineStyles = getProgressLineStyles()

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        <div className={cn(stepsVariants({ orientation }), 'relative')}>
          {/* Progress Bar Background */}
          {showProgressBar && steps.length > 1 && isHorizontal && (
            <div
              className="absolute top-5 h-[2px] bg-muted -translate-y-1/2"
              style={lineStyles.container}
            >
              {/* Animated Progress Bar */}
              <div
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${animatedProgress}%` }}
              />
            </div>
          )}
          
          {/* Vertical Progress Bar */}
          {showProgressBar && steps.length > 1 && !isHorizontal && (
            <div
              className="absolute left-5 top-10 bottom-10 w-[2px] bg-muted -translate-x-1/2"
            >
              {/* Animated Progress Bar */}
              <div
                className="w-full bg-primary transition-all duration-500 ease-out"
                style={{ height: `${animatedProgress}%` }}
              />
            </div>
          )}

          {/* Steps */}
          {steps.map((step, index) => {
            const status = getStepStatus(index, step)
            const colors = getStepColors(status)
            const isClickable = allowClickableSteps && (canNavigateToStep ? canNavigateToStep(index) : status === 'completed')

            return (
              <div
                key={step.id || index}
                className={cn(
                  'relative z-10',
                  isHorizontal ? 'flex-1 flex justify-center' : 'flex',
                  index !== 0 && (isHorizontal ? '' : 'mt-8')
                )}
              >
                <button
                  className={cn(
                    'flex items-center',
                    isHorizontal ? 'flex-col' : 'flex-row',
                    isClickable && 'cursor-pointer',
                    !isClickable && 'cursor-default'
                  )}
                  onClick={() => isClickable && onStepClick?.(index)}
                  disabled={!isClickable}
                  type="button"
                >
                  {/* Step Circle */}
                  {displayMode !== 'label-only' && (
                    <div
                      className={cn(
                        'relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300',
                        colors.bg,
                        colors.text,
                        colors.border,
                        status === 'current' && 'ring-4 ring-primary/20',
                        status === 'loading' && 'animate-pulse'
                      )}
                    >
                      {getStepIcon(status, step.icon)}
                      
                      {/* Pulse Animation for Current Step */}
                      {status === 'current' && (
                        <div 
                          className="absolute inset-0 rounded-full bg-primary opacity-20" 
                          style={{
                            animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) 1'
                          }}
                        />
                      )}
                    </div>
                  )}

                  {/* Step Content */}
                  {displayMode !== 'icon-only' && (
                    <div
                      className={cn(
                        'transition-all duration-300',
                        isHorizontal 
                          ? 'mt-3 text-center' 
                          : 'ml-4 text-left flex-1'
                      )}
                    >
                      {(displayMode === 'all' || displayMode === 'label-only' || displayMode === 'icon-label') && (
                        <div className={cn('text-sm', colors.labelText)}>
                          {step.label}
                        </div>
                      )}
                      {(displayMode === 'all' && step.description) && (
                        <div
                          className={cn(
                            'text-xs mt-1 transition-opacity duration-300',
                            status === 'upcoming' 
                              ? 'text-muted-foreground/60' 
                              : 'text-muted-foreground'
                          )}
                        >
                          {step.description}
                        </div>
                      )}
                    </div>
                  )}
                </button>

                {/* Status Indicator */}
                {status === 'error' && (
                  <div className={cn(
                    'absolute flex items-center gap-1 text-xs text-destructive',
                    isHorizontal 
                      ? 'left-1/2 -translate-x-1/2 -bottom-6' 
                      : 'left-14 top-1'
                  )}>
                    <AlertCircle className="h-3 w-3" />
                    <span>Error</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)

Steps.displayName = 'Steps'

export { Steps }