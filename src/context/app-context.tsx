
'use client';

import * as React from 'react';
import { createContext } from 'react';
import { type Patient, type Hba1cRecord, type WeightRecord, type FastingBloodGlucoseRecord, type BloodPressureRecord, type ThyroidRecord, type MedicalCondition, type Medication, type ThyroxineRecord, type SerumCreatinineRecord, type UricAcidRecord, TotalCholesterolRecord, LdlRecord, HdlRecord, TriglyceridesRecord } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { produce } from 'immer';
import { getBmiStatus, calculateBmi } from '@/lib/utils';
import { toMmolL, toMgDl, toGL, toGDL } from '@/lib/unit-conversions';

type Theme = 'dark' | 'light' | 'system';
type BiomarkerUnit = 'conventional' | 'si';

export type BatchRecords = {
    patientName?: string;
    hba1c?: { date: string; value: number };
    fastingBloodGlucose?: { date: string; value: number };
    bloodPressure?: { date: string; systolic: number; diastolic: number; heartRate?: number };
    hemoglobin?: { date: string; hemoglobin: number };
    thyroid?: { date: string; tsh?: number; t3?: number; t4?: number };
    lipidPanel?: { date: string; totalCholesterol?: number; ldl?: number; hdl?: number; triglycerides?: number };
    vitaminD?: { date: string; value: number; units: 'ng/mL' | 'nmol/L' };
};


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
  addWeightRecord: (record: Omit<WeightRecord, 'id'>) => void;
  addFastingBloodGlucoseRecord: (record: Omit<FastingBloodGlucoseRecord, 'id'>) => void;
  addBloodPressureRecord: (record: Omit<BloodPressureRecord, 'id'>) => void;
  addThyroidRecord: (record: Omit<ThyroidRecord, 'id'>) => void;
  addMedicalCondition: (condition: Omit<MedicalCondition, 'id'>) => void;
  addMedication: (medication: Omit<Medication, 'id'>) => void;
  addThyroxineRecord: (record: Omit<ThyroxineRecord, 'id'>) => void;
  addSerumCreatinineRecord: (record: Omit<SerumCreatinineRecord, 'id'>) => void;
  addUricAcidRecord: (record: Omit<UricAcidRecord, 'id'>) => void;
  addTotalCholesterolRecord: (record: Omit<TotalCholesterolRecord, 'id'>) => void;
  addLdlRecord: (record: Omit<LdlRecord, 'id'>) => void;
  addHdlRecord: (record: Omit<HdlRecord, 'id'>) => void;
  addTriglyceridesRecord: (record: Omit<TriglyceridesRecord, 'id'>) => void;
  addBatchRecords: (records: BatchRecords) => Promise<{ added: string[], duplicates: string[] }>;

  removeHba1cRecord: (id: string) => void;
  removeWeightRecord: (id: string) => void;
  removeFastingBloodGlucoseRecord: (id: string) => void;
  removeBloodPressureRecord: (id: string) => void;
  removeThyroidRecord: (id: string) => void;
  removeMedication: (id: string) => void;
  removeMedicalCondition: (id: string) => void;
  removeThyroxineRecord: (id: string) => void;
  removeSerumCreatinineRecord: (id: string) => void;
  removeUricAcidRecord: (id: string) => void;
  removeTotalCholesterolRecord: (id: string) => void;
  removeLdlRecord: (id: string) => void;
  removeHdlRecord: (id: string) => void;
  removeTriglyceridesRecord: (id: string) => void;
  
  updateMedicalCondition: (condition: MedicalCondition) => void;
  updateMedication: (medication: Medication) => void;

  setMedicationNil: () => void;
  deleteProfile: () => void;
  getFullPatientData: () => Patient | null;

  // Derived state and utility functions
  profile: any; // Simplified for this context
  hba1cRecords: Hba1cRecord[];
  weightRecords: WeightRecord[];
  fastingBloodGlucoseRecords: FastingBloodGlucoseRecord[];
  bloodPressureRecords: BloodPressureRecord[];
  thyroidRecords: ThyroidRecord[];
  thyroxineRecords: ThyroxineRecord[];
  serumCreatinineRecords: SerumCreatinineRecord[];
  uricAcidRecords: UricAcidRecord[];
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
  getDisplayVitaminDValue: (dbValue: number, unit: 'ng/mL' | 'nmol/L') => number;
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
        // Update BMI whenever patient data changes (e.g., height update)
        const latestWeight = [...(newPatient.weightRecords || [])].sort((a,b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())[0];
        const newBmi = calculateBmi(latestWeight?.value, newPatient.height);
        const patientWithBmi = produce(newPatient, draft => {
            draft.bmi = newBmi;
        });
        localStorage.setItem('patientData', JSON.stringify(patientWithBmi));
        setPatientState(patientWithBmi); // update state with BMI
    } else if (isClient && !isReadOnlyView && !newPatient) {
        localStorage.removeItem('patientData');
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

  const createRecordAdder = <T extends { id: string }>(recordType: keyof Patient) => (record: Omit<T, 'id'>) => {
      if (!patient) return;
      const newRecord = { ...record, id: uuidv4() } as T;
      const nextState = produce(patient, draft => {
          (draft[recordType] as T[]).push(newRecord);

          // Recalculate BMI if a new weight record is added
          if (recordType === 'weightRecords') {
              draft.bmi = calculateBmi((record as unknown as WeightRecord).value, draft.height);
          }
      });
      setPatient(nextState);
  };
  
  const createRecordRemover = (recordType: keyof Patient) => (id: string) => {
    if (!patient) return;
    const nextState = produce(patient, draft => {
        const recordIndex = (draft[recordType] as any[]).findIndex(r => r.id === id);
        if (recordIndex > -1) {
            (draft[recordType] as any[]).splice(recordIndex, 1);
        }
    });
    setPatient(nextState);
  };
  
  const addHba1cRecord = createRecordAdder<Hba1cRecord>('hba1cRecords');
  const addWeightRecord = createRecordAdder<WeightRecord>('weightRecords');
  const addFastingBloodGlucoseRecord = createRecordAdder<FastingBloodGlucoseRecord>('fastingBloodGlucoseRecords');
  const addBloodPressureRecord = createRecordAdder<BloodPressureRecord>('bloodPressureRecords');
  const addThyroidRecord = createRecordAdder<ThyroidRecord>('thyroidRecords');
  const addMedicalCondition = createRecordAdder<MedicalCondition>('presentMedicalConditions');
  const addMedication = createRecordAdder<Medication>('medication');
  const addThyroxineRecord = createRecordAdder<ThyroxineRecord>('thyroxineRecords');
  const addSerumCreatinineRecord = createRecordAdder<SerumCreatinineRecord>('serumCreatinineRecords');
  const addUricAcidRecord = createRecordAdder<UricAcidRecord>('uricAcidRecords');
  const addTotalCholesterolRecord = createRecordAdder<TotalCholesterolRecord>('totalCholesterolRecords');
  const addLdlRecord = createRecordAdder<LdlRecord>('ldlRecords');
  const addHdlRecord = createRecordAdder<HdlRecord>('hdlRecords');
  const addTriglyceridesRecord = createRecordAdder<TriglyceridesRecord>('triglyceridesRecords');
  
  const removeHba1cRecord = createRecordRemover('hba1cRecords');
  const removeWeightRecord = createRecordRemover('weightRecords');
  const removeFastingBloodGlucoseRecord = createRecordRemover('fastingBloodGlucoseRecords');
  const removeBloodPressureRecord = createRecordRemover('bloodPressureRecords');
  const removeThyroidRecord = createRecordRemover('thyroidRecords');
  const removeMedication = createRecordRemover('medication');
  const removeMedicalCondition = createRecordRemover('presentMedicalConditions');
  const removeThyroxineRecord = createRecordRemover('thyroxineRecords');
  const removeSerumCreatinineRecord = createRecordRemover('serumCreatinineRecords');
  const removeUricAcidRecord = createRecordRemover('uricAcidRecords');
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
        }
    });
    setPatient(nextState);
  };
  
  const updateMedication = (medication: Medication) => {
    if (!patient) return;
    const nextState = produce(patient, draft => {
        const index = draft.medication.findIndex(m => m.id === medication.id);
        if (index !== -1) {
            draft.medication[index] = medication;
        }
    });
    setPatient(nextState);
  };

  const setMedicationNil = () => {
    if (!patient) return;
    const nextState = produce(patient, draft => {
        draft.medication = [{ id: 'nil', name: 'Nil', brandName: 'Nil', dosage: '', frequency: '' }];
    });
    setPatient(nextState);
  }

  const deleteProfile = () => {
    setPatient(null);
  }

  const getFullPatientData = () => {
    return patient;
  }
  
  const addBatchRecords = async (records: BatchRecords): Promise<{ added: string[], duplicates: string[] }> => {
    if (!patient) return { added: [], duplicates: [] };
    
    let added: string[] = [];
    let duplicates: string[] = [];

    const nextState = produce(patient, draft => {
       const checkAndAdd = (recordType: keyof Patient, newRecordData: any, recordName: string) => {
            if (!newRecordData) return;
            const existingRecords = draft[recordType] as { date: string }[];
            const newRecordDate = new Date(newRecordData.date).toISOString().split('T')[0];
            const isDuplicate = existingRecords.some(r => new Date(r.date).toISOString().split('T')[0] === newRecordDate);

            if (isDuplicate) {
                duplicates.push(recordName);
            } else {
                (existingRecords as any[]).push({ ...newRecordData, id: uuidv4() });
                added.push(recordName);
            }
        };
        
        checkAndAdd('hba1cRecords', records.hba1c, 'HbA1c');
        checkAndAdd('fastingBloodGlucoseRecords', records.fastingBloodGlucose, 'Fasting Glucose');
        checkAndAdd('bloodPressureRecords', records.bloodPressure, 'Blood Pressure');
        checkAndAdd('hemoglobinRecords', records.hemoglobin, 'Hemoglobin');
        checkAndAdd('thyroidRecords', records.thyroid, 'Thyroid Panel');
        
        if (records.lipidPanel) {
            const { date, totalCholesterol, ldl, hdl, triglycerides } = records.lipidPanel;
            if (totalCholesterol) checkAndAdd('totalCholesterolRecords', { date, value: totalCholesterol }, 'Total Cholesterol');
            if (ldl) checkAndAdd('ldlRecords', { date, value: ldl }, 'LDL');
            if (hdl) checkAndAdd('hdlRecords', { date, value: hdl }, 'HDL');
            if (triglycerides) checkAndAdd('triglyceridesRecords', { date, value: triglycerides }, 'Triglycerides');
        }
    });

    setPatient(nextState);
    return { added, duplicates };
  };
  
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
        // Most metric countries use SI units, but we allow override.
        // Let's default to SI for metric system countries unless set.
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
  
  const getDisplayVitaminDValue = (dbValue: number, unit: 'ng/mL' | 'nmol/L') => {
      // Conversion factor: 1 ng/mL = 2.496 nmol/L
      if (unit === 'nmol/L' && biomarkerUnit === 'conventional') {
          return parseFloat((dbValue / 2.496).toFixed(1)); // to ng/mL
      }
      if (unit === 'ng/mL' && biomarkerUnit === 'si') {
          return parseFloat((dbValue * 2.496).toFixed(1)); // to nmol/L
      }
      return dbValue;
  }

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
    addWeightRecord,
    addFastingBloodGlucoseRecord,
    addBloodPressureRecord,
    addThyroidRecord,
    addMedicalCondition,
    addMedication,
    addThyroxineRecord,
    addSerumCreatinineRecord,
    addUricAcidRecord,
    addTotalCholesterolRecord,
    addLdlRecord,
    addHdlRecord,
    addTriglyceridesRecord,
    addBatchRecords,
    removeHba1cRecord,
    removeWeightRecord,
    removeFastingBloodGlucoseRecord,
    removeBloodPressureRecord,
    removeThyroidRecord,
    removeMedication,
    removeMedicalCondition,
    removeThyroxineRecord,
    removeSerumCreatinineRecord,
    removeUricAcidRecord,
    removeTotalCholesterolRecord,
    removeLdlRecord,
    removeHdlRecord,
    removeTriglyceridesRecord,
    updateMedicalCondition,
    updateMedication,
    setMedicationNil,
    deleteProfile,
    getFullPatientData,
    profile,
    hba1cRecords: patient?.hba1cRecords || [],
    weightRecords: patient?.weightRecords || [],
    fastingBloodGlucoseRecords: patient?.fastingBloodGlucoseRecords || [],
    bloodPressureRecords: patient?.bloodPressureRecords || [],
    thyroidRecords: patient?.thyroidRecords || [],
    thyroxineRecords: patient?.thyroxineRecords || [],
    serumCreatinineRecords: patient?.serumCreatinineRecords || [],
    uricAcidRecords: patient?.uricAcidRecords || [],
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
    getDisplayVitaminDValue,
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
