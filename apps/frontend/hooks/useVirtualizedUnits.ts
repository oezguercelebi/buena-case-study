'use client'

import { useMemo, useCallback } from 'react'
import { OnboardingUnitData } from '../types/property'

interface VirtualizedUnitsHookProps {
  units: OnboardingUnitData[]
  containerHeight?: number
  itemHeight?: number
}

interface VirtualizedUnitItem {
  index: number
  unit: OnboardingUnitData
  style: React.CSSProperties
}

export const useVirtualizedUnits = ({
  units,
  containerHeight = 400,
  itemHeight = 45
}: VirtualizedUnitsHookProps) => {
  // Calculate visible range based on scroll position
  const getVisibleRange = useCallback((scrollTop: number) => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      units.length
    )
    
    return { startIndex, endIndex }
  }, [itemHeight, containerHeight, units.length])

  // Generate items for virtual scrolling
  const generateVirtualItems = useCallback((scrollTop: number): VirtualizedUnitItem[] => {
    const { startIndex, endIndex } = getVisibleRange(scrollTop)
    const items: VirtualizedUnitItem[] = []

    for (let index = startIndex; index < endIndex; index++) {
      if (units[index]) {
        items.push({
          index,
          unit: units[index],
          style: {
            position: 'absolute',
            top: index * itemHeight,
            left: 0,
            right: 0,
            height: itemHeight,
          }
        })
      }
    }

    return items
  }, [units, itemHeight, getVisibleRange])

  // Total height for scroll container
  const totalHeight = useMemo(() => units.length * itemHeight, [units.length, itemHeight])

  // Performance metrics
  const performanceMetrics = useMemo(() => ({
    totalUnits: units.length,
    isLargeDataset: units.length > 50,
    estimatedMemoryFootprint: units.length * itemHeight,
    recommendedContainerHeight: Math.min(containerHeight, 500)
  }), [units.length, itemHeight, containerHeight])

  return {
    generateVirtualItems,
    getVisibleRange,
    totalHeight,
    itemHeight,
    performanceMetrics
  }
}