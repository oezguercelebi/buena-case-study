'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { OnboardingPropertyData, STORAGE_KEYS } from '../types/property'
import { PropertyValidationService, StepValidation } from '../services/validation'
import { useAutosaveDebounce } from '../hooks/useDebounce'
import { api } from '../utils/api'

interface OnboardingState {
  data: OnboardingPropertyData
  currentStep: number
  isLoading: boolean
  isSaving: boolean
  lastSaved: Date | null
  errors: Record<string, string[]>
  hasUnsavedChanges: boolean
  propertyId: string | null // Track the created property ID
}

type OnboardingAction =
  | { type: 'SET_DATA'; payload: Partial<OnboardingPropertyData> }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_LAST_SAVED'; payload: Date | null }
  | { type: 'SET_ERRORS'; payload: Record<string, string[]> }
  | { type: 'SET_UNSAVED_CHANGES'; payload: boolean }
  | { type: 'SET_PROPERTY_ID'; payload: string | null }
  | { type: 'RESET_STATE' }
  | { type: 'LOAD_FROM_STORAGE'; payload: OnboardingState }

interface OnboardingContextValue {
  state: OnboardingState
  updateData: (updates: Partial<OnboardingPropertyData>) => void
  setCurrentStep: (step: number) => void
  setPropertyId: (id: string | null) => void
  saveToLocalStorage: () => void
  loadFromLocalStorage: () => boolean
  saveToAPI: (isCompleting?: boolean) => Promise<void>
  validateStep: (step: number) => StepValidation
  resetOnboarding: () => void
  canNavigateToStep: (step: number) => boolean
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined)

const initialState: OnboardingState = {
  data: {
    aiExtractionEnabled: true,
    currentStep: 0,
    completedSteps: [],
    managementCompany: 'Buena Property Management GmbH',
    propertyManager: 'Max Mustermann',
    accountant: 'jane-smith',
  },
  currentStep: 0,
  isLoading: false,
  isSaving: false,
  lastSaved: null,
  errors: {},
  hasUnsavedChanges: false,
  propertyId: null,
}

function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case 'SET_DATA':
      return {
        ...state,
        data: { ...state.data, ...action.payload },
        hasUnsavedChanges: true,
      }
    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentStep: action.payload,
        data: { ...state.data, currentStep: action.payload },
      }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_SAVING':
      return { ...state, isSaving: action.payload }
    case 'SET_LAST_SAVED':
      return { 
        ...state, 
        lastSaved: action.payload,
        hasUnsavedChanges: false,
      }
    case 'SET_ERRORS':
      return { ...state, errors: action.payload }
    case 'SET_UNSAVED_CHANGES':
      return { ...state, hasUnsavedChanges: action.payload }
    case 'SET_PROPERTY_ID':
      return { ...state, propertyId: action.payload }
    case 'RESET_STATE':
      return initialState
    case 'LOAD_FROM_STORAGE':
      return action.payload
    default:
      return state
  }
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(onboardingReducer, initialState)

  const updateData = useCallback((updates: Partial<OnboardingPropertyData>) => {
    const updatedData = { ...updates, lastModified: new Date() }
    dispatch({ type: 'SET_DATA', payload: updatedData })
    // Ensure property ID is preserved
    const currentPropertyId = state.propertyId || localStorage.getItem(STORAGE_KEYS.PROPERTY_ID)
    if (currentPropertyId && !state.propertyId) {
      dispatch({ type: 'SET_PROPERTY_ID', payload: currentPropertyId })
    }
  }, [state.propertyId])

  const setCurrentStep = useCallback((step: number) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: step })
    // Mark ONLY previous steps as completed (not the current one)
    if (step > 0) {
      const completedSteps = Array.from({ length: step }, (_, i) => i)
      updateData({ completedSteps })
    }
  }, [updateData])

  const setPropertyId = useCallback((id: string | null) => {
    dispatch({ type: 'SET_PROPERTY_ID', payload: id })
    if (id) {
      localStorage.setItem(STORAGE_KEYS.PROPERTY_ID, id)
    } else {
      localStorage.removeItem(STORAGE_KEYS.PROPERTY_ID)
    }
  }, [])

  const saveToLocalStorage = useCallback(() => {
    try {
      const dataToSave = {
        ...state.data,
        lastModified: new Date(),
      }
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_DATA, JSON.stringify(dataToSave))
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_STEP, state.currentStep.toString())
      localStorage.setItem(STORAGE_KEYS.LAST_SAVED, new Date().toISOString())
      if (state.propertyId) {
        localStorage.setItem(STORAGE_KEYS.PROPERTY_ID, state.propertyId)
      }
      
      dispatch({ type: 'SET_LAST_SAVED', payload: new Date() })
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }, [state.data, state.currentStep, state.propertyId])

  const loadFromLocalStorage = useCallback((): boolean => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEYS.ONBOARDING_DATA)
      const savedStep = localStorage.getItem(STORAGE_KEYS.ONBOARDING_STEP)
      const lastSaved = localStorage.getItem(STORAGE_KEYS.LAST_SAVED)
      const propertyId = localStorage.getItem(STORAGE_KEYS.PROPERTY_ID)

      if (savedData) {
        const parsedData: OnboardingPropertyData = JSON.parse(savedData)
        
        // Ensure all buildings have IDs
        if (parsedData.buildings) {
          parsedData.buildings = parsedData.buildings.map(b => ({
            ...b,
            id: b.id || `building-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          }))
        }
        
        const currentStep = savedStep ? parseInt(savedStep, 10) : 0
        const lastSavedDate = lastSaved ? new Date(lastSaved) : null

        dispatch({
          type: 'LOAD_FROM_STORAGE',
          payload: {
            ...state,
            data: parsedData,
            currentStep,
            lastSaved: lastSavedDate,
            hasUnsavedChanges: false,
            propertyId: propertyId || null,
          },
        })
        return true
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
    }
    return false
  }, [])

  const saveToAPI = useCallback(async (isCompleting: boolean = false) => {
    if (!state.data.name || !state.data.type) {
      throw new Error('Missing required property information')
    }

    dispatch({ type: 'SET_SAVING', payload: true })
    
    try {
      // Transform onboarding data to API format
      const propertyData = {
        name: state.data.name,
        type: state.data.type,
        propertyNumber: state.data.propertyNumber || `PROP-${Date.now()}`,
        managementCompany: state.data.managementCompany,
        propertyManager: state.data.propertyManager,
        accountant: state.data.accountant,
        address: state.data.address,
        buildings: state.data.buildings || [],
        currentStep: isCompleting ? 3 : state.currentStep + 1, // Backend expects 1-based step numbers
        step1Complete: state.currentStep >= 0,
        step2Complete: state.currentStep >= 1,
        step3Complete: isCompleting, // Only mark complete when user clicks "Complete Property"
      }

      let response: any;
      if (state.propertyId) {
        // Update existing property using autosave endpoint
        response = await api.patch(`/property/${state.propertyId}/autosave`, propertyData)
        // Ensure we maintain the property ID
        if (response && response.id && response.id !== state.propertyId) {
          console.warn('Property ID mismatch after update:', { expected: state.propertyId, received: response.id })
        }
      } else {
        // Create new property
        response = await api.post('/property', propertyData)
        // Store the new property ID
        if (response && response.id) {
          dispatch({ type: 'SET_PROPERTY_ID', payload: response.id })
          localStorage.setItem(STORAGE_KEYS.PROPERTY_ID, response.id)
        }
      }
      
      dispatch({ type: 'SET_LAST_SAVED', payload: new Date() })
    } catch (error) {
      console.error('Failed to save to API:', error)
      throw error
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false })
    }
  }, [state.data, state.propertyId, state.currentStep])

  const validateStep = useCallback((step: number): StepValidation => {
    switch (step) {
      case 0: // General Information
        return PropertyValidationService.validatePropertyStep(state.data)
      case 1: // Building Data  
        return PropertyValidationService.validateBuildingsStep(state.data)
      case 2: // Units
        return PropertyValidationService.validateUnitsStep(state.data)
      default:
        return { isValid: true, errors: [], completedFields: 0, totalFields: 0 }
    }
  }, [state.data])

  const resetOnboarding = useCallback(() => {
    dispatch({ type: 'RESET_STATE' })
    localStorage.removeItem(STORAGE_KEYS.ONBOARDING_DATA)
    localStorage.removeItem(STORAGE_KEYS.ONBOARDING_STEP)
    localStorage.removeItem(STORAGE_KEYS.LAST_SAVED)
    localStorage.removeItem(STORAGE_KEYS.PROPERTY_ID)
  }, [])

  const canNavigateToStep = useCallback((targetStep: number): boolean => {
    if (targetStep <= state.currentStep) {
      return true // Can always go back
    }
    
    // Can only go forward if current step is valid
    const validation = validateStep(state.currentStep)
    return validation.isValid
  }, [state.currentStep, validateStep])

  // Note: We don't auto-load from localStorage anymore
  // The OnboardingFlow component will handle loading after validating the property exists

  // Debounced autosave setup
  const debouncedSave = useCallback(async () => {
    if (!state.hasUnsavedChanges || !state.data.name || !state.data.type) {
      return
    }

    try {
      await saveToAPI()
      console.log('Auto-saved property to API')
    } catch (error) {
      console.error('Auto-save failed:', error)
      // Fall back to localStorage on API failure
      saveToLocalStorage()
    }
  }, [state.hasUnsavedChanges, state.data.name, state.data.type, saveToAPI, saveToLocalStorage])

  const { triggerSave } = useAutosaveDebounce(
    debouncedSave,
    1500, // 1.5 seconds debounce - faster than before for better UX
    state.hasUnsavedChanges
  )

  // Trigger debounced save when data changes
  useEffect(() => {
    if (state.hasUnsavedChanges && state.data.name && state.data.type) {
      triggerSave()
    }
  }, [state.data, state.hasUnsavedChanges, triggerSave])

  const contextValue: OnboardingContextValue = {
    state,
    updateData,
    setCurrentStep,
    setPropertyId,
    saveToLocalStorage,
    loadFromLocalStorage,
    saveToAPI,
    validateStep,
    resetOnboarding,
    canNavigateToStep,
  }

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}