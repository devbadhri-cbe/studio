'use client';

import * as React from 'react';
import { type Patient, type Hba1cRecord } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { produce } from 'immer';

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
  
  // Data modification functions
  addHba1cRecord: (record: Omit<Hba1cRecord, 'id'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [patient, setPatientState] = React.useState<Patient | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isClient, setIsClient] = React.useState(false);
  const [theme, setThemeState] = React.useState<Theme>('system');
  const [isReadOnlyView, setIsReadOnlyView] = React.useState(false);

  React.useEffect(() => {
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
      localStorage.setItem('patientData', JSON.stringify(newPatient));
    }
  }
  
  const setPatientData: AppContextType['setPatientData'] = (data, isReadOnly) => {
    setPatientState(data);
    setIsReadOnlyView(isReadOnly);
  }

  React.useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      setThemeState(storedTheme);
    }
  }, []);
  
  React.useEffect(() => {
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

  const setTheme = React.useCallback((theme: Theme) => {
    setThemeState(theme);
  }, []);

  // Data modification functions
  const addHba1cRecord = React.useCallback((record: Omit<Hba1cRecord, 'id'>) => {
    if (!patient) return;
    const newRecord = { ...record, id: uuidv4() };
    const nextState = produce(patient, draft => {
        draft.hba1cRecords.push(newRecord);
    });
    setPatient(nextState);
  }, [patient, setPatient]);

  const value: AppContextType = {
    patient,
    setPatient,
    isLoading,
    isClient,
    theme,
    setTheme,
    isReadOnlyView,
    setPatientData,
    addHba1cRecord,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
