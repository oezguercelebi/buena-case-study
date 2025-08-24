'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { OnboardingPropertyData, STORAGE_KEYS } from '../types/property'
import { PropertyValidationService, StepValidation } from '../services/validation'
import { api } from '../utils/api'

interface OnboardingState {
  data: OnboardingPropertyData
  currentStep: number
  isLoading: boolean
  isSaving: boolean
  lastSaved: Date | null
  errors: Record<string, string[]>
  hasUnsavedChanges: boolean
}

type OnboardingAction =
  | { type: 'SET_DATA'; payload: Partial<OnboardingPropertyData> }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_LAST_SAVED'; payload: Date | null }
  | { type: 'SET_ERRORS'; payload: Record<string, string[]> }
  | { type: 'SET_UNSAVED_CHANGES'; payload: boolean }
  | { type: 'RESET_STATE' }
  | { type: 'LOAD_FROM_STORAGE'; payload: OnboardingState }

interface OnboardingContextValue {
  state: OnboardingState
  updateData: (updates: Partial<OnboardingPropertyData>) => void
  setCurrentStep: (step: number) => void
  saveToLocalStorage: () => void
  loadFromLocalStorage: () => boolean
  saveToAPI: () => Promise<void>
  validateStep: (step: number) => StepValidation
  resetOnboarding: () => void
  canNavigateToStep: (step: number) => boolean
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined)

const initialState: OnboardingState = {
  data: {
    aiExtractionEnabled: true,
    isDraft: true,
    currentStep: 0,
    completedSteps: [],
  },
  currentStep: 0,
  isLoading: false,
  isSaving: false,
  lastSaved: null,
  errors: {},
  hasUnsavedChanges: false,
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

  // Load data from localStorage on mount
  useEffect(() => {
    const success = loadFromLocalStorage()
    if (success) {
      console.log('Loaded existing onboarding data from localStorage')
    }
  }, [])

  // Auto-save to localStorage when data changes
  useEffect(() => {
    if (state.hasUnsavedChanges) {
      const timeoutId = setTimeout(() => {
        saveToLocalStorage()
      }, 1000) // Save after 1 second of inactivity

      return () => clearTimeout(timeoutId)
    }
  }, [state.data, state.hasUnsavedChanges])

  const updateData = useCallback((updates: Partial<OnboardingPropertyData>) => {
    const updatedData = { ...updates, lastModified: new Date() }
    dispatch({ type: 'SET_DATA', payload: updatedData })
  }, [])

  const setCurrentStep = useCallback((step: number) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: step })
    // Mark previous steps as completed
    const completedSteps = Array.from({ length: step }, (_, i) => i)
    updateData({ completedSteps })
  }, [updateData])

  const saveToLocalStorage = useCallback(() => {
    try {
      const dataToSave = {
        ...state.data,
        lastModified: new Date(),
      }
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_DATA, JSON.stringify(dataToSave))
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_STEP, state.currentStep.toString())
      localStorage.setItem(STORAGE_KEYS.LAST_SAVED, new Date().toISOString())
      
      dispatch({ type: 'SET_LAST_SAVED', payload: new Date() })
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }, [state.data, state.currentStep])

  const loadFromLocalStorage = useCallback((): boolean => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEYS.ONBOARDING_DATA)
      const savedStep = localStorage.getItem(STORAGE_KEYS.ONBOARDING_STEP)
      const lastSaved = localStorage.getItem(STORAGE_KEYS.LAST_SAVED)

      if (savedData) {
        const parsedData: OnboardingPropertyData = JSON.parse(savedData)
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
          },
        })
        return true
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
    }
    return false
  }, [])

  const saveToAPI = useCallback(async () => {
    if (!state.data.propertyName || !state.data.propertyType) {
      throw new Error('Missing required property information')
    }

    dispatch({ type: 'SET_SAVING', payload: true })
    
    try {
      // Transform onboarding data to API format
      const propertyData = {
        name: state.data.propertyName,
        type: state.data.propertyType,
        propertyNumber: state.data.propertyNumber || `PROP-${Date.now()}`,
        managementCompany: state.data.managementCompany,
        propertyManager: state.data.propertyManager,
        accountant: state.data.accountant,
        buildings: state.data.buildings || [],
        status: 'draft',
      }

      await api.post('/properties', propertyData)
      
      // Clear localStorage after successful save
      localStorage.removeItem(STORAGE_KEYS.ONBOARDING_DATA)
      localStorage.removeItem(STORAGE_KEYS.ONBOARDING_STEP)
      localStorage.removeItem(STORAGE_KEYS.LAST_SAVED)
      
      dispatch({ type: 'SET_LAST_SAVED', payload: new Date() })
    } catch (error) {
      console.error('Failed to save to API:', error)
      throw error
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false })
    }
  }, [state.data])

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
  }, [])

  const canNavigateToStep = useCallback((targetStep: number): boolean => {
    if (targetStep <= state.currentStep) {
      return true // Can always go back
    }
    
    // Can only go forward if current step is valid
    const validation = validateStep(state.currentStep)
    return validation.isValid
  }, [state.currentStep, validateStep])

  const contextValue: OnboardingContextValue = {
    state,
    updateData,
    setCurrentStep,
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