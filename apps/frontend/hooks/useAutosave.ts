'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useOnboarding } from '../contexts/OnboardingContext'

interface UseAutosaveOptions {
  debounceMs?: number
  apiSyncIntervalMs?: number
  enabled?: boolean
}

export function useAutosave(options: UseAutosaveOptions = {}) {
  const {
    debounceMs = 30000, // 30 seconds as per PRD
    apiSyncIntervalMs = 300000, // 5 minutes for API sync
    enabled = true,
  } = options

  const { state, saveToLocalStorage, saveToAPI } = useOnboarding()
  const debounceTimeoutRef = useRef<NodeJS.Timeout>()
  const apiSyncTimeoutRef = useRef<NodeJS.Timeout>()
  const lastSyncRef = useRef<Date | null>(null)

  // Debounced localStorage save
  const debouncedSave = useCallback(() => {
    if (!enabled) return

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    // Set new timeout
    debounceTimeoutRef.current = setTimeout(() => {
      saveToLocalStorage()
    }, debounceMs)
  }, [enabled, debounceMs, saveToLocalStorage])

  // API sync functionality
  const syncToAPI = useCallback(async () => {
    if (!enabled || !state.data.name || !state.data.type) {
      return
    }

    try {
      await saveToAPI()
      lastSyncRef.current = new Date()
    } catch (error) {
      console.error('Failed to sync to API:', error)
      // Continue with localStorage saving even if API fails
    }
  }, [enabled, state.data.name, state.data.type, saveToAPI])

  // Periodic API sync
  const schedulePeriodicAPISync = useCallback(() => {
    if (!enabled) return

    if (apiSyncTimeoutRef.current) {
      clearInterval(apiSyncTimeoutRef.current)
    }

    apiSyncTimeoutRef.current = setInterval(async () => {
      if (state.hasUnsavedChanges) {
        await syncToAPI()
      }
    }, apiSyncIntervalMs)
  }, [enabled, apiSyncIntervalMs, syncToAPI, state.hasUnsavedChanges])

  // Trigger autosave when data changes
  useEffect(() => {
    if (state.hasUnsavedChanges) {
      debouncedSave()
    }
  }, [state.data, state.hasUnsavedChanges, debouncedSave])

  // Start periodic API sync
  useEffect(() => {
    if (enabled) {
      schedulePeriodicAPISync()
    }

    return () => {
      if (apiSyncTimeoutRef.current) {
        clearInterval(apiSyncTimeoutRef.current)
      }
    }
  }, [enabled, schedulePeriodicAPISync])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      if (apiSyncTimeoutRef.current) {
        clearInterval(apiSyncTimeoutRef.current)
      }
    }
  }, [])

  // Force save function
  const forceSave = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    saveToLocalStorage()
  }, [saveToLocalStorage])

  // Force API sync function
  const forceAPISync = useCallback(async () => {
    if (apiSyncTimeoutRef.current) {
      clearInterval(apiSyncTimeoutRef.current)
    }
    await syncToAPI()
    schedulePeriodicAPISync()
  }, [syncToAPI, schedulePeriodicAPISync])

  return {
    forceSave,
    forceAPISync,
    lastAPISync: lastSyncRef.current,
    isAutoSaveEnabled: enabled,
  }
}