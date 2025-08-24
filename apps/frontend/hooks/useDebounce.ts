'use client'

import { useCallback, useRef, useEffect } from 'react'

/**
 * Custom debounce hook optimized for performance
 * @param callback Function to debounce
 * @param delay Delay in milliseconds
 * @param deps Dependencies array for callback
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
) {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay, ...deps]
  )

  // Cancel pending timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Cancel function for manual cancellation
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  // Flush function to immediately execute pending callback
  const flush = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        callback(...args)
      }
    },
    [callback]
  )

  return {
    debouncedCallback,
    cancel,
    flush
  }
}

/**
 * Specialized debounce hook for autosave functionality
 */
export function useAutosaveDebounce(
  saveFunction: () => Promise<void> | void,
  delay: number = 1000,
  enabled: boolean = true
) {
  const { debouncedCallback, cancel, flush } = useDebounce(
    useCallback(async () => {
      if (!enabled) return
      
      try {
        await saveFunction()
        console.log('Auto-saved successfully')
      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    }, [saveFunction, enabled]),
    delay,
    [saveFunction, enabled]
  )

  return {
    triggerSave: debouncedCallback,
    cancelSave: cancel,
    flushSave: flush,
    isEnabled: enabled
  }
}