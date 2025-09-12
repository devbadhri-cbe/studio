

'use client';

import * as React from 'react';
import { type Patient, type MedicalCondition, type Medication, type ThyroidRecord, type WeightRecord, type BloodPressureRecord, type HemoglobinRecord, type FastingBloodGlucoseRecord, type Hba1cRecord, type TotalCholesterolRecord, type LdlRecord, type HdlRecord, type TriglyceridesRecord, BiomarkerKey, DiseasePanelKey, ThyroxineRecord, SerumCreatinineRecord, UricAcidRecord } from '@/lib/types';
import { useState, useEffect, createContext, useContext, useCallback, ReactNode, useMemo } from 'react';
import { toast } from '@/hooks/use-toast';
import { startOfDay, parseISO, isValid } from 'date-fns';
import { countries } from '@/lib/countries';
import { toMmolL, toGDL, toGL, toMgDl } from '@/lib/unit-conversions';
import { calculateBmi } from '@/lib/utils';
import { availableDiseasePanels } from '@/lib/biomarker-cards';
import { getHealthInsights } from '@/ai/flows/health-insights-flow';
import { LabDataExtractionOutput } from '@/lib/ai-types';

type Theme = 'dark' | 'light' | 'system';
export type BatchRecords = Partial<LabDataExtractionOutput>;
type BiomarkerUnitSystem = 'conventional' | 'si';
interface AddBatchRecordsResult {
    added: string[];
    duplicates: string[];
}

const supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'zh', name: 'Chinese' },
];

interface AppContextType {
  patient: Patient | null;
  setPatient: (patient: Patient | null) => void;
  isLoading: boolean;
  addMedicalCondition: (condition: MedicalCondition) => void;
  updateMedicalCondition: (condition: MedicalCondition) => void;
  removeMedicalCondition: (id: string) => void;
  addMedication: (medication: Omit<Medication, 'id'>) => void;
  updateMedication: (medication: Medication) => void;
  removeMedication: (id: string) => void;
  setMedicationNil: () => void;
  addHba1cRecord: (record: Omit<Hba1cRecord, 'id' | 'medication'>) => void;
  removeHba1cRecord: (id: string) => void;
  addFastingBloodGlucoseRecord: (record: Omit<FastingBloodGlucoseRecord, 'id' | 'medication'>) => void;
  removeFastingBloodGlucoseRecord: (id: string) => void;
  addThyroidRecord: (record: Omit<ThyroidRecord, 'id' | 'medication'>) => void;
  removeThyroidRecord: (id: string) => void;
  addThyroxineRecord: (record: Omit<ThyroxineRecord, 'id' | 'medication'>) => void;
  removeThyroxineRecord: (id: string) => void;
  addSerumCreatinineRecord: (record: Omit<SerumCreatinineRecord, 'id' | 'medication'>) => void;
  removeSerumCreatinineRecord: (id: string) => void;
  addUricAcidRecord: (record: Omit<UricAcidRecord, 'id' | 'medication'>) => void;
  removeUricAcidRecord: (id: string) => void;
  addHemoglobinRecord: (record: Omit<HemoglobinRecord, 'id' | 'medication'>) => void;
  removeHemoglobinRecord: (id: string) => void;
  addWeightRecord: (record: Omit<WeightRecord, 'id'>) => void;
  removeWeightRecord: (id: string) => void;
  addBloodPressureRecord: (record: Omit<BloodPressureRecord, 'id' | 'medication'>) => void;
  removeBloodPressureRecord: (id: string) => void;
  addTotalCholesterolRecord: (record: Omit<TotalCholesterolRecord, 'id' | 'medication'>) => void;
  removeTotalCholesterolRecord: (id: string) => void;
  addLdlRecord: (record: Omit<LdlRecord, 'id' | 'medication'>) => void;
  removeLdlRecord: (id: string) => void;
  addHdlRecord: (record: Omit<HdlRecord, 'id' | 'medication'>) => void;
  removeHdlRecord: (id: string) => void;
  addTriglyceridesRecord: (record: Omit<TriglyceridesRecord, 'id' | 'medication'>) => void;
  removeTriglyceridesRecord: (id: string) => void;
  addBatchRecords: (records: BatchRecords) => Promise<AddBatchRecordsResult>;
  tips: string[];
  isGeneratingInsights: boolean;
  isTranslatingInsights: boolean;
  insightsError: string | null;
  selectedInsightsLanguage: string;
  setSelectedInsightsLanguage: (lang: string) => void;
  regenerateInsights: (langCode: string) => Promise<void>;
  translateInsights: (langCode: string) => Promise<void>;
  isClient: boolean;
  biomarkerUnit: BiomarkerUnitSystem;
  setBiomarkerUnit: (unit: BiomarkerUnitSystem) => void;
  getDisplayGlucoseValue: (value: number) => number;
  getDisplayHemoglobinValue: (value: number) => number;
  getDisplayLipidValue: (value: number, type: 'total' | 'ldl' | 'hdl' | 'triglycerides') => number;
  getDbGlucoseValue: (value: number) => number;
  getDbHemoglobinValue: (value: number) => number;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleDiseaseBiomarker: (panelKey: string, biomarkerKey: BiomarkerKey | string) => void;
  toggleDiseasePanel: (panelKey: DiseasePanelKey) => void;
  isReadOnlyView: boolean;
  approveMedicalCondition: (conditionId: string) => void;
  dismissSuggestion: (conditionId: string) => void;
  getFullPatientData: () => Patient | null;
  profile: Patient | null;
  deleteProfile: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [theme, setThemeState] = useState<Theme>('system');
  const [biomarkerUnit, setBiomarkerUnitState] = useState<BiomarkerUnitSystem>('conventional');
  const [isReadOnlyView, setIsReadOnlyView] = React.useState(false);
  
  const [tips, setTips] = useState<string[]>([]);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [isTranslatingInsights, setIsTranslatingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [selectedInsightsLanguage, setSelectedInsightsLanguage] = React.useState('en');
  
  const profile = patient;

  // Centralized data saving to local storage
  const savePatient = (data: Patient | null) => {
    if (isClient && !isReadOnlyView && data) {
      localStorage.setItem('patientData', JSON.stringify(data));
    }
  }

  // Initial data load from local storage
  useEffect(() => {
    setIsClient(true);
    try {
      const localDataString = localStorage.getItem('patientData');
      if (localDataString) {
        const localPatientData: Patient = JSON.parse(localDataString);
        setPatient(localPatientData);
        const countryInfo = countries.find(c => c.code === localPatientData.country);
        setBiomarkerUnitState(countryInfo?.biomarkerUnit || 'conventional');
      }
    } catch (e) {
      console.error("Failed to parse local patient data", e);
      localStorage.removeItem('patientData');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Theme management
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

  const setBiomarkerUnit = useCallback((unit: BiomarkerUnitSystem) => {
    setBiomarkerUnitState(unit);
  }, []);

  const getDisplayGlucoseValue = useCallback((value: number): number => {
      if (biomarkerUnit === 'si') {
          return parseFloat(toMmolL(value, 'glucose').toFixed(1));
      }
      return Math.round(value);
  }, [biomarkerUnit]);
  
  const getDisplayHemoglobinValue = useCallback((value: number): number => {
    if (biomarkerUnit === 'si') {
        return parseFloat(toGL(value).toFixed(1));
    }
    return parseFloat(value.toFixed(1));
  }, [biomarkerUnit]);

  const getDisplayLipidValue = useCallback((value: number, type: 'total' | 'ldl' | 'hdl' | 'triglycerides'): number => {
    if (biomarkerUnit === 'si') {
      return parseFloat(toMmolL(value, type).toFixed(2));
    }
    return Math.round(value);
  }, [biomarkerUnit]);

  const getDbGlucoseValue = useCallback((value: number): number => {
      if (biomarkerUnit === 'si') {
        return toMgDl(value, 'glucose');
      }
      return value;
  }, [biomarkerUnit]);
  
  const getDbHemoglobinValue = useCallback((value: number): number => {
    if (biomarkerUnit === 'si') {
        return toGDL(value);
    }
    return value;
  }, [biomarkerUnit]);
  
  const getLatestReadings = useCallback(() => {
    if (!profile) return {};
    const getLatest = <T extends { date: string | Date }>(records: T[]) => [...(records || [])].sort((a,b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())[0];
    return {
        hba1c: getLatest(profile.hba1cRecords)?.value,
        fastingBloodGlucose: getLatest(profile.fastingBloodGlucoseRecords) ? getDisplayGlucoseValue(getLatest(profile.fastingBloodGlucoseRecords)!.value) : undefined,
        weight: getLatest(profile.weightRecords)?.value,
        bloodPressure: getLatest(profile.bloodPressureRecords) ? { systolic: getLatest(profile.bloodPressureRecords)!.systolic, diastolic: getLatest(profile.bloodPressureRecords)!.diastolic } : undefined,
    }
  }, [profile, getDisplayGlucoseValue]);


  const regenerateInsights = useCallback(async (languageCode: string) => {
    if (!profile) return;
    setIsGeneratingInsights(true);
    setInsightsError(null);
    setTips([]);

    try {
      const result = await getHealthInsights({
            language: supportedLanguages.find(l => l.code === languageCode)?.name || 'English',
            patient: {
                age: profile.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : undefined,
                gender: profile.gender,
                bmi: profile.bmi,
                conditions: profile.presentMedicalConditions.map(c => c.condition),
                medications: profile.medication.map(m => m.name),
            },
            latestReadings: getLatestReadings(),
        });
        if (result.tips) {
          setTips(result.tips);
        } else {
          throw new Error("No tips returned from AI.");
        }
    } catch(e) {
        console.error(e);
        setInsightsError('Failed to generate insights. Please try again.');
    } finally {
        setIsGeneratingInsights(false);
    }
  }, [profile, getLatestReadings]);
  
  const translateInsights = useCallback(async (languageCode: string) => {
    if (!profile) return;
    setIsTranslatingInsights(true);
    setInsightsError(null);
    
    try {
      const result = await getHealthInsights({
            language: supportedLanguages.find(l => l.code === languageCode)?.name || 'English',
            patient: {
                age: profile.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : undefined,
                gender: profile.gender,
                bmi: profile.bmi,
                conditions: profile.presentMedicalConditions.map(c => c.condition),
                medications: profile.medication.map(m => m.name),
            },
            latestReadings: getLatestReadings()
        });
        if (result.tips) {
            setTips(result.tips);
        } else {
            throw new Error("No translated tips returned from AI.");
        }
    } catch(e) {
        console.error(e);
        setInsightsError('Failed to translate insights.');
    } finally {
        setIsTranslatingInsights(false);
    }
  }, [profile, getLatestReadings]);
  

  const getMedicationForRecord = useCallback((medication?: Medication[]): string => {
    if (!medication || !Array.isArray(medication) || medication.length === 0) return 'N/A';
    try {
      return JSON.stringify(medication.map(m => ({name: m.name, dosage: m.dosage, frequency: m.frequency})));
    } catch {
      return 'N/A';
    }
  }, []);

  const addMedicalCondition = useCallback((condition: MedicalCondition) => {
    setPatient(prev => {
        const newState = prev ? ({...prev, presentMedicalConditions: [...prev.presentMedicalConditions, condition]}) : null;
        if(newState) savePatient(newState);
        return newState;
    });
  }, []);

  const updateMedicalCondition = useCallback((condition: MedicalCondition) => {
    setPatient(prev => {
        const newState = prev ? ({ ...prev, presentMedicalConditions: prev.presentMedicalConditions.map(c => c.id === condition.id ? condition : c)}) : null;
        if(newState) savePatient(newState);
        return newState;
    });
  }, []);
  
  const removeMedicalCondition = useCallback((id: string) => {
    setPatient(prev => {
        const newState = prev ? ({ ...prev, presentMedicalConditions: prev.presentMedicalConditions.filter(c => c.id !== id)}) : null;
        if(newState) savePatient(newState);
        return newState;
    });
  }, []);
  
   const addMedication = useCallback((medication: Omit<Medication, 'id'>) => {
    const newMedication = { ...medication, id: Date.now().toString() };
    setPatient(prev => {
        if (!prev) return null;
        const isCurrentlyNil = prev.medication.length === 1 && prev.medication[0].name.toLowerCase() === 'nil';
        const newMedicationList = isCurrentlyNil ? [newMedication] : [...prev.medication, newMedication];
        const newState = { ...prev, medication: newMedicationList };
        savePatient(newState);
        return newState;
    });
  }, []);

  const updateMedication = useCallback((medication: Medication) => {
    setPatient(prev => {
        const newState = prev ? ({ ...prev, medication: prev.medication.map(m => m.id === medication.id ? medication : m)}) : null;
        if(newState) savePatient(newState);
        return newState;
    });
  }, []);

  const removeMedication = useCallback((id: string) => {
    setPatient(prev => {
        if (!prev) return null;
        const updatedMedication = prev.medication.filter(m => m.id !== id);
        const newMedicationList = updatedMedication.length === 0 
            ? [{ id: 'nil', name: 'Nil', brandName: 'Nil', dosage: '', frequency: '' }]
            : updatedMedication;
        const newState = { ...prev, medication: newMedicationList };
        savePatient(newState);
        return newState;
    });
  }, []);

  const setMedicationNil = useCallback(() => {
    setPatient(prev => {
        const newState = prev ? { ...prev, medication: [{ id: 'nil', name: 'Nil', brandName: 'Nil', dosage: '', frequency: '' }] } : null;
        if(newState) savePatient(newState);
        return newState;
    });
  }, []);

  const addHba1cRecord = useCallback((record: Omit<Hba1cRecord, 'id' | 'medication'>) => {
    setPatient(prev => {
        const newState = prev ? ({...prev, hba1cRecords: [...prev.hba1cRecords, { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(prev.medication) }]}) : null;
        if(newState) savePatient(newState);
        return newState;
    });
  }, [getMedicationForRecord]);

  const removeHba1cRecord = useCallback((id: string) => {
    setPatient(prev => {
        const newState = prev ? ({...prev, hba1cRecords: prev.hba1cRecords.filter(r => r.id !== id)}) : null;
        if(newState) savePatient(newState);
        return newState;
    });
  }, []);
  
  const addFastingBloodGlucoseRecord = useCallback((record: Omit<FastingBloodGlucoseRecord, 'id' | 'medication'>) => {
    setPatient(prev => {
        const newState = prev ? ({...prev, fastingBloodGlucoseRecords: [...prev.fastingBloodGlucoseRecords, { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(prev.medication) }]}) : null;
        if(newState) savePatient(newState);
        return newState;
    });
  }, [getMedicationForRecord]);

  const removeFastingBloodGlucoseRecord = useCallback((id: string) => {
    setPatient(prev => {
        const newState = prev ? ({...prev, fastingBloodGlucoseRecords: prev.fastingBloodGlucoseRecords.filter(r => r.id !== id)}) : null;
        if(newState) savePatient(newState);
        return newState;
    });
  }, []);

  const addThyroidRecord = useCallback((record: Omit<ThyroidRecord, 'id' | 'medication'>) => {
    setPatient(prev => {
        const newState = prev ? ({...prev, thyroidRecords: [...prev.thyroidRecords, { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(prev.medication) }]}) : null;
        if(newState) savePatient(newState);
        return newState;
    });
  }, [getMedicationForRecord]);

  const removeThyroidRecord = useCallback((id: string) => {
    setPatient(prev => {
        const newState = prev ? ({...prev, thyroidRecords: prev.thyroidRecords.filter(r => r.id !== id)}) : null;
        if(newState) savePatient(newState);
        return newState;
    });
  }, []);
  
  const addThyroxineRecord = useCallback((record: Omit<ThyroxineRecord, 'id' | 'medication'>) => {
    setPatient(prev => {
        const newState = prev ? ({...prev, thyroxineRecords: [...prev.thyroxineRecords, { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(prev.medication) }]}) : null;
        if(newState) savePatient(newState);
        return newState;
    });
  }, [getMedicationForRecord]);

  const removeThyroxineRecord = useCallback((id: string) => {
    setPatient(prev => {
        const newState = prev ? ({...prev, thyroxineRecords: prev.thyroxineRecords.filter(r => r.id !== id)}) : null;
        if(newState) savePatient(newState);
        return newState;
    });
  }, []);
  
  const addSerumCreatinineRecord = useCallback((record: Omit<SerumCreatinineRecord, 'id' | 'medication'>) => {
    setPatient(prev => {
        const newState = prev ? ({...prev, serumCreatinineRecords: [...prev.serumCreatinineRecords, { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(prev.medication) }]}) : null;
        if(newState) savePatient(newState);
        return newState;
    });
  }, [getMedicationForRecord]);

  const removeSerumCreatinineRecord = useCallback((id: string) => {
    setPatient(prev => {
        const newState = prev ? ({...prev, serumCreatinineRecords: prev.serumCreatinineRecords.filter(r => r.id !== id)}) : null;
        if(newState) savePatient(newState);
        return newState;
    });
  }, []);

  const addUricAcidRecord = useCallback((record: Omit<UricAcidRecord, 'id' | 'medication'>) => {
    setPatient(prev => {
        const newState = prev ? ({...prev, uricAcidRecords: [...prev.uricAcidRecords, { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(prev.medication) }]}) : null;
        if(newState) savePatient(newState);
        return newState;
    });
  }, [getMedicationForRecord]);

  const removeUricAcidRecord = useCallback((id: string) => {
    setPatient(prev => {
        const newState = prev ? ({...prev, uricAcidRecords: prev.uricAcidRecords.filter(r => r.id !== id)}) : null;
        if(newState) savePatient(newState);
        return newState;
    });
  }, []);

  const addHemoglobinRecord = useCallback((record: Omit<HemoglobinRecord, 'id' | 'medication'>) => {
    setPatient(prev => {
        const newState = prev ? ({...prev, hemoglobinRecords: [...prev.hemoglobinRecords, { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(prev.medication) }]}) : null;
        if(newState) savePatient(newState);
        return newState;
    });
  }, [getMedicationForRecord]);

  const removeHemoglobinRecord = useCallback((id: string) => {
    setPatient(prev => {
        const newState = prev ? ({...prev, hemoglobinRecords: prev.hemoglobinRecords.filter(r => r.id !== id)}) : null;
        if(newState) savePatient(newState);
        return newState;
    });
  }, []);
  
  const addWeightRecord = useCallback((record: Omit<WeightRecord, 'id'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString() };
    setPatient(prev => {
        if (!prev) return null;
        const updatedRecords = [...prev.weightRecords, newRecord];
        const newBmi = calculateBmi(newRecord.value, prev.height);
        const newState = { ...prev, weightRecords: updatedRecords, bmi: newBmi };
        savePatient(newState);
        return newState;
    });
  }, []);

  const removeWeightRecord = useCallback((id: string) => {
    setPatient(prev => {
        if (!prev) return null;
        const updatedRecords = prev.weightRecords.filter(r => r.id !== id);
        const newLatestRecord = [...updatedRecords].sort((a,b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())[0];
        const newBmi = calculateBmi(newLatestRecord?.value, prev.height);
        const newState = { ...prev, weightRecords: updatedRecords, bmi: newBmi };
        savePatient(newState);
        return newState;
    });
  }, []);
  
  const addBloodPressureRecord = useCallback((record: Omit<BloodPressureRecord, 'id' | 'medication'>) => {
    setPatient(prev => {
        const newState = prev ? ({...prev, bloodPressureRecords: [...prev.bloodPressureRecords, { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(prev.medication) }]}) : null;
        if(newState) savePatient(newState);
        return newState;
    });
  }, [getMedicationForRecord]);

  const removeBloodPressureRecord = useCallback((id: string) => {
    setPatient(prev => {
        const newState = prev ? ({...prev, bloodPressureRecords: prev.bloodPressureRecords.filter(r => r.id !== id)}) : null;
        if(newState) savePatient(newState);
        return newState;
    });
  }, []);

  const addTotalCholesterolRecord = useCallback((record: Omit<TotalCholesterolRecord, 'id' | 'medication'>) => {
    setPatient(prev => {
        const newState = prev ? ({...prev, totalCholesterolRecords: [...prev.totalCholesterolRecords, { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(prev.medication) }]}) : null;
        if(newState) savePatient(newState);
        return newState;
    });
  }, [getMedicationForRecord]);

  const removeTotalCholesterolRecord = useCallback((id: string) => {
    setPatient(prev => {
        const newState = prev ? ({...prev, totalCholesterolRecords: prev.totalCholesterolRecords.filter(r => r.id !== id)}) : null;
        if(newState) savePatient(newState);
        return newState;
    });
  }, []);

  const addLdlRecord = useCallback((record: Omit<LdlRecord, 'id' | 'medication'>) => {
    setPatient(prev => {
        const newState = prev ? ({...prev, ldlRecords: [...prev.ldlRecords, { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(prev.medication) }]}) : null;
        if(newState) savePatient(newState);
        return newState;
    });
  }, [getMedicationForRecord]);

  const removeLdlRecord = useCallback((id: string) => {
    setPatient(prev => {
        const newState = prev ? ({...prev, ldlRecords: prev.ldlRecords.filter(r => r.id !== id)}) : null;
        if(newState) savePatient(newState);
        return newState;
    });
  }, []);
  
  const addHdlRecord = useCallback((record: Omit<HdlRecord, 'id' | 'medication'>) => {
    setPatient(prev => {
        const newState = prev ? ({...prev, hdlRecords: [...prev.hdlRecords, { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(prev.medication) }]}) : null;
        if(newState) savePatient(newState);
        return newState;
    });
  }, [getMedicationForRecord]);

  const removeHdlRecord = useCallback((id: string) => {
    setPatient(prev => {
        const newState = prev ? ({...prev, hdlRecords: prev.hdlRecords.filter(r => r.id !== id)}) : null;
        if(newState) savePatient(newState);
        return newState;
    });
  }, []);

  const addTriglyceridesRecord = useCallback((record: Omit<TriglyceridesRecord, 'id' | 'medication'>) => {
    setPatient(prev => {
        const newState = prev ? ({...prev, triglyceridesRecords: [...prev.triglyceridesRecords, { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(prev.medication) }]}) : null;
        if(newState) savePatient(newState);
        return newState;
    });
  }, [getMedicationForRecord]);

  const removeTriglyceridesRecord = useCallback((id: string) => {
    setPatient(prev => {
        const newState = prev ? ({...prev, triglyceridesRecords: prev.triglyceridesRecords.filter(r => r.id !== id)}) : null;
        if(newState) savePatient(newState);
        return newState;
    });
  }, []);

  const toggleDiseaseBiomarker = useCallback((panelKey: string, biomarkerKey: BiomarkerKey | string) => {
    setPatient(prev => {
        if (!prev) return null;
        const currentEnabled = { ...(prev.enabledBiomarkers || {}) };
        const panelBiomarkers = currentEnabled[panelKey] || [];
        
        const newPanelBiomarkers = panelBiomarkers.includes(biomarkerKey)
          ? panelBiomarkers.filter(b => b !== biomarkerKey)
          : [...panelBiomarkers, biomarkerKey];

        const newState = {
          ...prev,
          enabledBiomarkers: { ...currentEnabled, [panelKey]: newPanelBiomarkers }
        };
        savePatient(newState);
        return newState;
    });
  }, []);

  const toggleDiseasePanel = useCallback((panelKey: DiseasePanelKey) => {
    setPatient(prev => {
        if (!prev) return null;
        const currentEnabled = { ...(prev.enabledBiomarkers || {}) };
        const isCurrentlyEnabled = currentEnabled.hasOwnProperty(panelKey);
        const updatedEnabledBiomarkers = { ...currentEnabled };

        if (isCurrentlyEnabled) {
          delete updatedEnabledBiomarkers[panelKey];
        } else {
          updatedEnabledBiomarkers[panelKey] = [];
        }
        
        const panelInfo = availableDiseasePanels.find(p => p.key === panelKey);
        const panelName = panelInfo?.label || (panelKey.charAt(0).toUpperCase() + panelKey.slice(1) + ' Panel');
        
        toast({
            title: isCurrentlyEnabled ? `Panel Disabled` : `Panel Enabled`,
            description: `The ${panelName} has been ${isCurrentlyEnabled ? 'disabled' : 'enabled'} for this patient.`
        });
        
        const newState = { ...prev, enabledBiomarkers: updatedEnabledBiomarkers };
        savePatient(newState);
        return newState;
    });
  }, []);

  const addBatchRecords = useCallback(async (batch: BatchRecords): Promise<AddBatchRecordsResult> => {
    const result: AddBatchRecordsResult = { added: [], duplicates: [] };
    const dateStr = batch.hba1c?.date || batch.fastingBloodGlucose?.date || batch.thyroid?.date || batch.bloodPressure?.date || batch.hemoglobin?.date || batch.lipidPanel?.date;

    if (!dateStr || !isValid(parseISO(dateStr))) {
      toast({ variant: "destructive", title: "Missing or Invalid Date" });
      return result;
    }
    const recordDate = startOfDay(parseISO(dateStr));
    
    setPatient(prev => {
      if (!prev) return null;
      let newPatient: Patient = { ...prev };

      const checkAndAdd = <T extends { date: string | Date }>(
          records: T[] | undefined,
          newRecordData: Omit<T, 'id' | 'date'> & { date: string },
          recordName: string,
          updateState: (p: Patient, r: T[]) => Patient
      ): void => {
          const currentRecords = records || [];
          const exists = currentRecords.some(r => startOfDay(parseISO(r.date as string)).getTime() === recordDate.getTime());
          if (!exists) {
              result.added.push(recordName);
              const newRecords = [...currentRecords, { ...newRecordData, id: `${recordName}-${Date.now()}` } as T];
              newPatient = updateState(newPatient, newRecords);
          } else {
              result.duplicates.push(recordName);
          }
      };

      if (batch.hba1c?.value) {
        checkAndAdd(newPatient.hba1cRecords, { ...batch.hba1c, date: recordDate.toISOString() }, 'HbA1c', (p, r) => ({...p, hba1cRecords: r}));
      }
      if (batch.fastingBloodGlucose?.value) {
        checkAndAdd(newPatient.fastingBloodGlucoseRecords, { ...batch.fastingBloodGlucose, date: recordDate.toISOString() }, 'Fasting Glucose', (p, r) => ({...p, fastingBloodGlucoseRecords: r}));
      }
      if (batch.thyroid) {
        checkAndAdd(newPatient.thyroidRecords, {tsh:0, t3:0, t4:0, ...batch.thyroid, date: recordDate.toISOString() }, 'Thyroid', (p, r) => ({...p, thyroidRecords: r}));
      }
      if (batch.bloodPressure) {
        checkAndAdd(newPatient.bloodPressureRecords, { ...batch.bloodPressure, date: recordDate.toISOString() }, 'Blood Pressure', (p, r) => ({...p, bloodPressureRecords: r}));
      }
      if (batch.hemoglobin) {
        checkAndAdd(newPatient.hemoglobinRecords, { ...batch.hemoglobin, date: recordDate.toISOString() }, 'Hemoglobin', (p, r) => ({...p, hemoglobinRecords: r}));
      }
      if (batch.lipidPanel?.totalCholesterol) {
        checkAndAdd(newPatient.totalCholesterolRecords, { value: batch.lipidPanel.totalCholesterol, date: recordDate.toISOString() }, 'Total Cholesterol', (p, r) => ({...p, totalCholesterolRecords: r}));
      }
      if (batch.lipidPanel?.ldl) {
        checkAndAdd(newPatient.ldlRecords, { value: batch.lipidPanel.ldl, date: recordDate.toISOString() }, 'LDL', (p, r) => ({...p, ldlRecords: r}));
      }
      if (batch.lipidPanel?.hdl) {
        checkAndAdd(newPatient.hdlRecords, { value: batch.lipidPanel.hdl, date: recordDate.toISOString() }, 'HDL', (p, r) => ({...p, hdlRecords: r}));
      }
      if (batch.lipidPanel?.triglycerides) {
        checkAndAdd(newPatient.triglyceridesRecords, { value: batch.lipidPanel.triglycerides, date: recordDate.toISOString() }, 'Triglycerides', (p, r) => ({...p, triglyceridesRecords: r}));
      }
      
      savePatient(newPatient);
      return newPatient;
    });
    
    return result;
  }, []);

  const setTheme = useCallback((theme: Theme) => {
    setThemeState(theme);
  }, []);

  const approveMedicalCondition = useCallback((conditionId: string) => {
    setPatient(prev => {
        if (!prev) return null;
        const newConditions = prev.presentMedicalConditions.map(c => c.id === conditionId ? { ...c, status: 'verified' } : c);
        toast({ title: 'Condition Approved', description: 'The medical condition has been marked as verified.' });
        const newState = { ...prev, presentMedicalConditions: newConditions };
        savePatient(newState);
        return newState;
    });
  }, []);

  const dismissSuggestion = useCallback((conditionId: string) => {
    setPatient(prev => {
        if (!prev) return null;
        const newConditions = prev.presentMedicalConditions.map(c => c.id === conditionId ? { ...c, status: 'needs_revision' } : c);
        toast({ title: 'Condition Dismissed', description: 'The condition has been marked for patient revision.' });
        const newState = { ...prev, presentMedicalConditions: newConditions };
        savePatient(newState);
        return newState;
    });
  }, []);
  
  const getFullPatientData = useCallback((): Patient | null => {
    return patient;
  }, [patient]);
  
  const deleteProfile = useCallback(() => {
    localStorage.removeItem('patientData');
    window.location.reload();
  }, []);

  const value: AppContextType = {
    patient,
    setPatient,
    isLoading,
    addMedicalCondition,
    updateMedicalCondition,
    removeMedicalCondition,
    addMedication,
    updateMedication,
    removeMedication,
    setMedicationNil,
    addHba1cRecord,
    removeHba1cRecord,
    addFastingBloodGlucoseRecord,
    removeFastingBloodGlucoseRecord,
    addThyroidRecord,
    removeThyroidRecord,
    addThyroxineRecord,
    removeThyroxineRecord,
    addSerumCreatinineRecord,
    removeSerumCreatinineRecord,
    addUricAcidRecord,
    removeUricAcidRecord,
    addHemoglobinRecord,
    removeHemoglobinRecord,
    addWeightRecord,
    removeWeightRecord,
    addBloodPressureRecord,
    removeBloodPressureRecord,
    addTotalCholesterolRecord,
    removeTotalCholesterolRecord,
    addLdlRecord,
    removeLdlRecord,
    addHdlRecord,
    removeHdlRecord,
    addTriglyceridesRecord,
    removeTriglyceridesRecord,
    addBatchRecords,
    tips,
    isGeneratingInsights,
    isTranslatingInsights,
    insightsError,
    selectedInsightsLanguage,
    setSelectedInsightsLanguage,
    regenerateInsights,
    translateInsights,
    isClient,
    biomarkerUnit,
    setBiomarkerUnit,
    getDisplayGlucoseValue,
    getDisplayHemoglobinValue,
    getDisplayLipidValue,
    getDbGlucoseValue,
    getDbHemoglobinValue,
    theme,
    setTheme,
    toggleDiseaseBiomarker,
    toggleDiseasePanel,
    isReadOnlyView,
    approveMedicalCondition,
    dismissSuggestion,
    getFullPatientData,
    profile,
    deleteProfile,
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
