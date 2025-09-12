'use client';

import * as React from 'react';
import { type Patient, type MedicalCondition, type Medication, type ThyroidRecord, type WeightRecord, type BloodPressureRecord, type HemoglobinRecord, type FastingBloodGlucoseRecord, type Hba1cRecord } from '@/lib/types';
import { useState, useEffect, createContext, useContext, useCallback, ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface AppContextType {
  patient: Patient | null;
  setPatient: (patient: Patient | null) => void;
  isLoading: boolean;
  isClient: boolean;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isReadOnlyView: boolean;
  setPatientData: (data: Patient, isReadOnly: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [patient, setPatientState] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [theme, setThemeState] = useState<Theme>('system');
  const [isReadOnlyView, setIsReadOnlyView] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const localDataString = localStorage.getItem('patientData');
      if (localDataString) {
        const localPatientData: Patient = JSON.parse(localDataString);
        setPatientState(localPatientData);
      }
    } catch (e) {
      console.error("Failed to parse local patient data", e);
      localStorage.removeItem('patientData');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setPatient: AppContextType['setPatient'] = (newPatient) => {
    setPatientState(newPatient);
    if (isClient && !isReadOnlyView && newPatient) {
        // Saving to localStorage is now handled at the point of creation/update
        // to avoid race conditions.
    }
  }
  
  const setPatientData: AppContextType['setPatientData'] = (data, isReadOnly) => {
    setPatientState(data);
    setIsReadOnlyView(isReadOnly);
  }

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      setThemeState(storedTheme);
    }
  }, []);
  
  useEffect(() => {
    if (isClient) {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');

      let effectiveTheme = theme;
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        effectiveTheme = systemTheme;
      }
      
      root.classList.add(effectiveTheme);
      localStorage.setItem('theme', theme);
    }
  }, [theme, isClient]);

  const setTheme = useCallback((theme: Theme) => {
    setThemeState(theme);
  }, []);

  const value: AppContextType = {
    patient,
    setPatient,
    isLoading,
    isClient,
    theme,
    setTheme,
    isReadOnlyView,
    setPatientData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
