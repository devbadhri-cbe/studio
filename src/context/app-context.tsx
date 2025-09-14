
'use client';

import * as React from 'react';
import { createContext } from 'react';
import { type Patient, type Hba1cRecord, type WeightRecord, type FastingBloodGlucoseRecord, type BloodPressureRecord, type MedicalCondition, type Medication, type SerumCreatinineRecord, type UricAcidRecord, TotalCholesterolRecord, LdlRecord, HdlRecord, TriglyceridesRecord, DiseasePanelState, HemoglobinRecord } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { produce } from 'immer';
import { calculateBmi } from '@/lib/utils';
import { toMmolL, toMgDl, toGL, toGDL } from '@/lib/unit-conversions';
import { useToast } from '@/hooks/use-toast';

type Theme = 'dark' | 'light' | 'system';
type BiomarkerUnit = 'conventional' | 'si';

export type BatchRecords = {
    patientName?: string;
    hba1c?: { date: string; value: number };
    fastingBloodGlucose?: { date: string; value: number };
    bloodPressure?: { date: string; systolic: number; diastolic: number; heartRate?: number };
    hemoglobin?: { date: string; hemoglobin: number };
    lipidPanel?: { date: string; totalCholesterol?: number; ldl?: number; hdl?: number; triglycerides?: number };
};


interface AppContextType {
  patient: Patient | null;
  setPatient: (patient: Patient | null) => void;
  isLoading: boolean;
  isClient: boolean;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDeveloperMode: boolean;
  setIsDeveloperMode: (isDeveloper: boolean) => void;
  
  // Data modification functions
  addHba1cRecord: (record: Omit<Hba1cRecord, 'id'>) => string;
  addWeightRecord: (record: Omit<WeightRecord, 'id'>) => string;
  addFastingBloodGlucoseRecord: (record: Omit<FastingBloodGlucoseRecord, 'id'>) => string;
  addBloodPressureRecord: (record: Omit<BloodPressureRecord, 'id'>) => string;
  addMedicalCondition: (condition: Omit<MedicalCondition, 'id'>) => string;
  addMedication: (medication: Omit<Medication, 'id'>) => string;
  addSerumCreatinineRecord: (record: Omit<SerumCreatinineRecord, 'id'>) => string;
  addUricAcidRecord: (record: Omit<UricAcidRecord, 'id'>) => string;
  addHemoglobinRecord: (record: Omit<HemoglobinRecord, 'id'>) => string;
  addTotalCholesterolRecord: (record: Omit<TotalCholesterolRecord, 'id'>) => string;
  addLdlRecord: (record: Omit<LdlRecord, 'id'>) => string;
  addHdlRecord: (record: Omit<HdlRecord, 'id'>) => string;
  addTriglyceridesRecord: (record: Omit<TriglyceridesRecord, 'id'>) => string;

  removeHba1cRecord: (id: string) => void;
  removeWeightRecord: (id: string) => void;
  removeFastingBloodGlucoseRecord: (id: string) => void;
  removeBloodPressureRecord: (id: string) => void;
  removeMedication: (id: string) => void;
  removeMedicalCondition: (id: string) => void;
  removeSerumCreatinineRecord: (id: string) => void;
  removeUricAcidRecord: (id: string) => void;
  removeHemoglobinRecord: (id: string) => void;
  removeTotalCholesterolRecord: (id: string) => void;
  removeLdlRecord: (id: string) => void;
  removeHdlRecord: (id: string) => void;
  removeTriglyceridesRecord: (id: string) => void;
  
  updateMedicalCondition: (condition: MedicalCondition) => void;
  updateMedication: (medication: Medication) => void;
  approveMedicalCondition: (id: string) => void;
  dismissSuggestion: (id: string) => void;

  deleteProfile: () => void;
  getFullPatientData: () => Patient | null;

  // Derived state and utility functions
  profile: any; // Simplified for this context
  hba1cRecords: Hba1cRecord[];
  weightRecords: WeightRecord[];
  fastingBloodGlucoseRecords: FastingBloodGlucoseRecord[];
  bloodPressureRecords: BloodPressureRecord[];
  serumCreatinineRecords: SerumCreatinineRecord[];
  uricAcidRecords: UricAcidRecord[];
  hemoglobinRecords: HemoglobinRecord[];
  totalCholesterolRecords: TotalCholesterolRecord[];
  ldlRecords: LdlRecord[];
  hdlRecords: HdlRecord[];
  triglyceridesRecords: TriglyceridesRecord[];

  biomarkerUnit: BiomarkerUnit;
  setBiomarkerUnit: (unit: BiomarkerUnit) => void;
  getDisplayGlucoseValue: (dbValue: number) => number;
  getDbGlucoseValue: (displayValue: number) => number;
  getDisplayHemoglobinValue: (dbValue: number) => number;
  getDbHemoglobinValue: (displayValue: number) => number;
  getDisplayLipidValue: (dbValue: number, type: 'total' | 'ldl' | 'hdl' | 'triglycerides') => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultDiseasePanelState: DiseasePanelState = {
    diabetes: {
        hba1c: true,
        glucose: true,
    },
    hypertension: {
        bloodPressure: true,
        hemoglobin: false,
    },
    lipidPanel: {
        total: true,
        ldl: true,
        hdl: true,
        triglycerides: true,
    },
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [patient, setPatientState] = React.useState<Patient | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isClient, setIsClient] = React.useState(false);
  const [theme, setThemeState] = React.useState<Theme>('system');
  const [isDeveloperMode, setIsDeveloperMode] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    setIsClient(true);
    try {
      const localDataString = localStorage.getItem('patientData');
      if (localDataString) {
        const localPatientData: Patient = JSON.parse(localDataString);
        if (!localPatientData.diseasePanels) {
            localPatientData.diseasePanels = defaultDiseasePanelState;
        }
        setPatientState(localPatientData);
        setIsDeveloperMode(false); // Default to user mode when loading from storage
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
  };

  React.useEffect(() => {
    if (isClient) {
      if (patient) {
        // Update BMI whenever patient data changes (e.g., height update or new weight record)
        const patientWithBmi = produce(patient, draft => {
            const latestWeight = [...(draft.weightRecords || [])].sort((a,b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())[0];
            draft.bmi = calculateBmi(latestWeight?.value, draft.height);
        });

        localStorage.setItem('patientData', JSON.stringify(patientWithBmi));
      } else {
        localStorage.removeItem('patientData');
      }
    }
  }, [patient, isClient]);


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

  const createRecordAdder = <T extends { id: string }>(recordType: keyof Patient) => (record: Omit<T, 'id'>): string => {
      if (!patient) return '';
      const newRecord = { ...record, id: uuidv4() } as T;
      const nextState = produce(patient, draft => {
          if (!draft[recordType]) {
            (draft as any)[recordType] = [];
          }
          (draft[recordType] as T[]).push(newRecord);
      });
      setPatient(nextState);
      return newRecord.id;
  };
  
  const createRecordRemover = (recordType: keyof Patient) => (id: string) => {
    if (!patient) return;
    const nextState = produce(patient, draft => {
        const records = draft[recordType] as any[];
        const recordIndex = records ? records.findIndex(r => r.id === id) : -1;
        if (recordIndex > -1) {
            records.splice(recordIndex, 1);
        }
    });
    setPatient(nextState);
  };
  
  const addHba1cRecord = createRecordAdder<Hba1cRecord>('hba1cRecords');
  const addWeightRecord = createRecordAdder<WeightRecord>('weightRecords');
  const addFastingBloodGlucoseRecord = createRecordAdder<FastingBloodGlucoseRecord>('fastingBloodGlucoseRecords');
  const addBloodPressureRecord = createRecordAdder<BloodPressureRecord>('bloodPressureRecords');
  const addMedicalCondition = createRecordAdder<MedicalCondition>('presentMedicalConditions');
  const addMedication = createRecordAdder<Medication>('medication');
  const addSerumCreatinineRecord = createRecordAdder<SerumCreatinineRecord>('serumCreatinineRecords');
  const addUricAcidRecord = createRecordAdder<UricAcidRecord>('uricAcidRecords');
  const addHemoglobinRecord = createRecordAdder<HemoglobinRecord>('hemoglobinRecords');
  const addTotalCholesterolRecord = createRecordAdder<TotalCholesterolRecord>('totalCholesterolRecords');
  const addLdlRecord = createRecordAdder<LdlRecord>('ldlRecords');
  const addHdlRecord = createRecordAdder<HdlRecord>('hdlRecords');
  const addTriglyceridesRecord = createRecordAdder<TriglyceridesRecord>('triglyceridesRecords');
  
  const removeHba1cRecord = createRecordRemover('hba1cRecords');
  const removeWeightRecord = createRecordRemover('weightRecords');
  const removeFastingBloodGlucoseRecord = createRecordRemover('fastingBloodGlucoseRecords');
  const removeBloodPressureRecord = createRecordRemover('bloodPressureRecords');
  const removeMedication = createRecordRemover('medication');
  const removeMedicalCondition = createRecordRemover('presentMedicalConditions');
  const removeSerumCreatinineRecord = createRecordRemover('serumCreatinineRecords');
  const removeUricAcidRecord = createRecordRemover('uricAcidRecords');
  const removeHemoglobinRecord = createRecordRemover('hemoglobinRecords');
  const removeTotalCholesterolRecord = createRecordRemover('totalCholesterolRecords');
  const removeLdlRecord = createRecordRemover('ldlRecords');
  const removeHdlRecord = createRecordRemover('hdlRecords');
  const removeTriglyceridesRecord = createRecordRemover('triglyceridesRecords');

  const updateMedicalCondition = (condition: MedicalCondition) => {
    if (!patient) return;
    const nextState = produce(patient, draft => {
        const index = draft.presentMedicalConditions.findIndex(c => c.id === condition.id);
        if (index !== -1) {
            draft.presentMedicalConditions[index] = condition;
        } else {
            // This can happen if the component state is stale, add it instead.
            draft.presentMedicalConditions.push(condition);
        }
    });
    setPatient(nextState);
  };
  
  const approveMedicalCondition = (id: string) => {
    if (!patient) return;
    const nextState = produce(patient, draft => {
        const condition = draft.presentMedicalConditions.find(c => c.id === id);
        if (condition) {
            condition.status = 'verified';
        }
    });
    setPatient(nextState);
  }
  
  const dismissSuggestion = (id: string) => {
    removeMedicalCondition(id);
  }
  
  const updateMedication = (medication: Medication) => {
    if (!patient) return;
    const nextState = produce(patient, draft => {
        const index = draft.medication.findIndex(m => m.id === medication.id);
        if (index !== -1) {
            draft.medication[index] = medication;
        } else {
             draft.medication.push(medication);
        }
    });
    setPatient(nextState);
  };
  
  const deleteProfile = () => {
    setPatient(null);
  }

  const getFullPatientData = () => {
    return patient;
  }
  
  // ==================================================================
  // DERIVED STATE & UTILITY FUNCTIONS
  // ==================================================================
  
  const profile = React.useMemo(() => {
    if (!patient) return null;
    return {
        ...patient,
        age: patient.dob ? new Date().getFullYear() - new Date(patient.dob).getFullYear() : undefined,
    };
  }, [patient]);
  
  const [biomarkerUnit, setBiomarkerUnitState] = React.useState<BiomarkerUnit>('conventional');
  
  React.useEffect(() => {
    if (patient?.unitSystem === 'metric') {
        const storedUnit = localStorage.getItem('biomarkerUnit') as BiomarkerUnit;
        if(storedUnit) {
          setBiomarkerUnitState(storedUnit);
        } else {
          setBiomarkerUnitState('si');
        }
    } else {
        setBiomarkerUnitState('conventional');
    }
  }, [patient?.unitSystem]);

  const setBiomarkerUnit = (unit: BiomarkerUnit) => {
    setBiomarkerUnitState(unit);
    localStorage.setItem('biomarkerUnit', unit);
  };
  
  const getDisplayGlucoseValue = (dbValue: number) => {
    return biomarkerUnit === 'si' ? parseFloat(toMmolL(dbValue, 'glucose').toFixed(1)) : dbValue;
  };

  const getDbGlucoseValue = (displayValue: number) => {
    return biomarkerUnit === 'si' ? parseFloat(toMgDl(displayValue, 'glucose').toFixed(0)) : displayValue;
  };
  
  const getDisplayHemoglobinValue = (dbValue: number) => {
    return biomarkerUnit === 'si' ? parseFloat(toGL(dbValue).toFixed(0)) : dbValue;
  }
  
  const getDbHemoglobinValue = (displayValue: number) => {
    return biomarkerUnit === 'si' ? parseFloat(toGDL(displayValue).toFixed(1)) : displayValue;
  }
  
  const getDisplayLipidValue = (dbValue: number, type: 'total' | 'ldl' | 'hdl' | 'triglycerides') => {
    return biomarkerUnit === 'si' ? parseFloat(toMmolL(dbValue, type).toFixed(2)) : dbValue;
  }

  const value: AppContextType = {
    patient,
    setPatient,
    isLoading,
    isClient,
    theme,
    setTheme,
    isDeveloperMode,
    setIsDeveloperMode,
    addHba1cRecord,
    addWeightRecord,
    addFastingBloodGlucoseRecord,
    addBloodPressureRecord,
    addMedicalCondition,
    addMedication,
    addSerumCreatinineRecord,
    addUricAcidRecord,
    addHemoglobinRecord,
    addTotalCholesterolRecord,
    addLdlRecord,
    addHdlRecord,
    addTriglyceridesRecord,
    removeHba1cRecord,
    removeWeightRecord,
    removeFastingBloodGlucoseRecord,
    removeBloodPressureRecord,
    removeMedication,
    removeMedicalCondition,
    removeSerumCreatinineRecord,
    removeUricAcidRecord,
    removeHemoglobinRecord,
    removeTotalCholesterolRecord,
    removeLdlRecord,
    removeHdlRecord,
    removeTriglyceridesRecord,
    updateMedicalCondition,
    updateMedication,
    approveMedicalCondition,
    dismissSuggestion,
    deleteProfile,
    getFullPatientData,
    profile,
    hba1cRecords: patient?.hba1cRecords || [],
    weightRecords: patient?.weightRecords || [],
    fastingBloodGlucoseRecords: patient?.fastingBloodGlucoseRecords || [],
    bloodPressureRecords: patient?.bloodPressureRecords || [],
    serumCreatinineRecords: patient?.serumCreatinineRecords || [],
    uricAcidRecords: patient?.uricAcidRecords || [],
    hemoglobinRecords: patient?.hemoglobinRecords || [],
    totalCholesterolRecords: patient?.totalCholesterolRecords || [],
    ldlRecords: patient?.ldlRecords || [],
    hdlRecords: patient?.hdlRecords || [],
    triglyceridesRecords: patient?.triglyceridesRecords || [],
    biomarkerUnit,
    setBiomarkerUnit,
    getDisplayGlucoseValue,
    getDbGlucoseValue,
    getDisplayHemoglobinValue,
    getDbHemoglobinValue,
    getDisplayLipidValue,
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
