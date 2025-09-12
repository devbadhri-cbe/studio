
'use client';

import * as React from 'react';
import { type UserProfile, type MedicalCondition, type Patient, type Medication, type ThyroidRecord, type WeightRecord, type BloodPressureRecord, type HemoglobinRecord, type FastingBloodGlucoseRecord, type Hba1cRecord, DashboardSuggestion, type TotalCholesterolRecord, type LdlRecord, type HdlRecord, type TriglyceridesRecord, BiomarkerKey, DiseasePanelKey, ThyroxineRecord, SerumCreatinineRecord, UricAcidRecord } from '@/lib/types';
import { useState, useEffect, createContext, useContext, useCallback, ReactNode, useMemo } from 'react';
import { toast } from '@/hooks/use-toast';
import { startOfDay, parseISO, isValid } from 'date-fns';
import { countries } from '@/lib/countries';
import { toMmolL, toGDL, toGL, toMgDl } from '@/lib/unit-conversions';
import { calculateBmi } from '@/lib/utils';
import { availableDiseasePanels } from '@/lib/biomarker-cards';
import { getHealthInsights } from '@/ai/flows/health-insights-flow';
import { LabDataExtractionOutput } from '@/lib/ai-types';

const initialProfile: UserProfile = { id: '', name: 'User', dob: '', gender: 'female', country: 'IN', dateFormat: 'dd-MM-yyyy', unitSystem: 'metric', presentMedicalConditions: [], medication: [], enabledBiomarkers: {}, dashboardSuggestions: [] };

type DashboardView = 'thyroid' | 'hypertension' | 'report' | 'none';
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
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  getFullPatientData: () => Patient;
  hasLocalData: () => boolean;
  loadLocalPatientData: () => Patient | null;
  addMedicalCondition: (condition: MedicalCondition) => void;
  updateMedicalCondition: (condition: MedicalCondition) => void;
  removeMedicalCondition: (id: string) => void;
  addMedication: (medication: Omit<Medication, 'id'>) => void;
  updateMedication: (medication: Medication) => void;
  removeMedication: (id: string) => void;
  setMedicationNil: () => void;
  hba1cRecords: Hba1cRecord[];
  addHba1cRecord: (record: Omit<Hba1cRecord, 'id' | 'medication'>) => void;
  removeHba1cRecord: (id: string) => void;
  fastingBloodGlucoseRecords: FastingBloodGlucoseRecord[];
  addFastingBloodGlucoseRecord: (record: Omit<FastingBloodGlucoseRecord, 'id' | 'medication'>) => void;
  removeFastingBloodGlucoseRecord: (id: string) => void;
  thyroidRecords: ThyroidRecord[];
  addThyroidRecord: (record: Omit<ThyroidRecord, 'id' | 'medication'>) => void;
  removeThyroidRecord: (id: string) => void;
  thyroxineRecords: ThyroxineRecord[];
  addThyroxineRecord: (record: Omit<ThyroxineRecord, 'id' | 'medication'>) => void;
  removeThyroxineRecord: (id: string) => void;
  serumCreatinineRecords: SerumCreatinineRecord[];
  addSerumCreatinineRecord: (record: Omit<SerumCreatinineRecord, 'id' | 'medication'>) => void;
  removeSerumCreatinineRecord: (id: string) => void;
  uricAcidRecords: UricAcidRecord[];
  addUricAcidRecord: (record: Omit<UricAcidRecord, 'id' | 'medication'>) => void;
  removeUricAcidRecord: (id: string) => void;
  hemoglobinRecords: HemoglobinRecord[];
  addHemoglobinRecord: (record: Omit<HemoglobinRecord, 'id' | 'medication'>) => void;
  removeHemoglobinRecord: (id: string) => void;
  weightRecords: WeightRecord[];
  addWeightRecord: (record: Omit<WeightRecord, 'id'>) => void;
  removeWeightRecord: (id: string) => void;
  bloodPressureRecords: BloodPressureRecord[];
  addBloodPressureRecord: (record: Omit<BloodPressureRecord, 'id' | 'medication'>) => void;
  removeBloodPressureRecord: (id: string) => void;
  totalCholesterolRecords: TotalCholesterolRecord[];
  addTotalCholesterolRecord: (record: Omit<TotalCholesterolRecord, 'id' | 'medication'>) => void;
  removeTotalCholesterolRecord: (id: string) => void;
  ldlRecords: LdlRecord[];
  addLdlRecord: (record: Omit<LdlRecord, 'id' | 'medication'>) => void;
  removeLdlRecord: (id: string) => void;
  hdlRecords: HdlRecord[];
  addHdlRecord: (record: Omit<HdlRecord, 'id' | 'medication'>) => void;
  removeHdlRecord: (id: string) => void;
  triglyceridesRecords: TriglyceridesRecord[];
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
  setPatientData: (patient: Patient, isReadOnly?: boolean) => void;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile>(initialProfile);
  const [hba1cRecords, setHba1cRecordsState] = useState<Hba1cRecord[]>([]);
  const [fastingBloodGlucoseRecords, setFastingBloodGlucoseRecordsState] = useState<FastingBloodGlucoseRecord[]>([]);
  const [thyroidRecords, setThyroidRecordsState] = useState<ThyroidRecord[]>([]);
  const [thyroxineRecords, setThyroxineRecordsState] = useState<ThyroxineRecord[]>([]);
  const [serumCreatinineRecords, setSerumCreatinineRecordsState] = useState<SerumCreatinineRecord[]>([]);
  const [uricAcidRecords, setUricAcidRecordsState] = useState<UricAcidRecord[]>([]);
  const [hemoglobinRecords, setHemoglobinRecordsState] = useState<HemoglobinRecord[]>([]);
  const [weightRecords, setWeightRecordsState] = useState<WeightRecord[]>([]);
  const [bloodPressureRecords, setBloodPressureRecordsState] = useState<BloodPressureRecord[]>([]);
  const [totalCholesterolRecords, setTotalCholesterolRecordsState] = useState<TotalCholesterolRecord[]>([]);
  const [ldlRecords, setLdlRecordsState] = useState<LdlRecord[]>([]);
  const [hdlRecords, setHdlRecordsState] = useState<HdlRecord[]>([]);
  const [triglyceridesRecords, setTriglyceridesRecordsState] = useState<TriglyceridesRecord[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [theme, setThemeState] = useState<Theme>('system');
  const [biomarkerUnit, setBiomarkerUnitState] = useState<BiomarkerUnitSystem>('conventional');
  const [isReadOnlyView, setIsReadOnlyView] = React.useState(false);
  
  const [tips, setTips] = useState<string[]>([]);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [isTranslatingInsights, setIsTranslatingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [selectedInsightsLanguage, setSelectedInsightsLanguage] = React.useState('en');
  
  const getFullPatientData = useCallback((): Patient => {
    return {
        ...profile,
        hba1cRecords,
        fastingBloodGlucoseRecords,
        thyroidRecords,
        thyroxineRecords,
        serumCreatinineRecords,
        uricAcidRecords,
        hemoglobinRecords,
        weightRecords,
        bloodPressureRecords,
        totalCholesterolRecords,
        ldlRecords,
        hdlRecords,
        triglyceridesRecords,
    };
  }, [profile, hba1cRecords, fastingBloodGlucoseRecords, thyroidRecords, thyroxineRecords, serumCreatinineRecords, uricAcidRecords, hemoglobinRecords, weightRecords, bloodPressureRecords, totalCholesterolRecords, ldlRecords, hdlRecords, triglyceridesRecords]);

  useEffect(() => {
    if (isClient && !isReadOnlyView && profile.id) {
      try {
        const dataToSave = getFullPatientData();
        localStorage.setItem('patientData', JSON.stringify(dataToSave));
      } catch (e) {
        console.error("Failed to save data to local storage", e);
        toast({
          variant: "destructive",
          title: "Save Error",
          description: "Could not save changes to your device."
        });
      }
    }
  }, [profile, hba1cRecords, fastingBloodGlucoseRecords, thyroidRecords, thyroxineRecords, serumCreatinineRecords, uricAcidRecords, hemoglobinRecords, weightRecords, bloodPressureRecords, totalCholesterolRecords, ldlRecords, hdlRecords, triglyceridesRecords, isClient, isReadOnlyView, getFullPatientData]);
  
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      setThemeState(storedTheme);
    }
    const countryUnit = countries.find(c => c.code === profile.country)?.biomarkerUnit || 'conventional';
    setBiomarkerUnitState(countryUnit);
    setIsClient(true);
  }, [profile.country]);

  useEffect(() => {
    if (!isClient) return;
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    let effectiveTheme = theme;
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      effectiveTheme = systemTheme;
    }
    
    root.classList.add(effectiveTheme);
    localStorage.setItem('theme', theme);
  }, [theme, isClient]);

  const hasLocalData = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const data = localStorage.getItem('patientData');
        return data !== null && data.length > 0 && data !== 'null';
      } catch (e) {
        console.error("Could not access local storage:", e);
        return false;
      }
    }
    return false;
  }, []);

  const setPatientData = useCallback((patient: Patient, isReadOnly: boolean = false) => {
    setProfileState({
      id: patient.id,
      name: patient.name,
      dob: patient.dob,
      gender: patient.gender,
      email: patient.email,
      country: patient.country,
      phone: patient.phone,
      height: patient.height,
      dateFormat: patient.dateFormat || 'MM-dd-yyyy',
      unitSystem: patient.unitSystem || countries.find(c => c.code === patient.country)?.unitSystem || 'metric',
      medication: Array.isArray(patient.medication) ? patient.medication : [],
      presentMedicalConditions: Array.isArray(patient.presentMedicalConditions) ? patient.presentMedicalConditions : [],
      enabledBiomarkers: patient.enabledBiomarkers || {},
      bmi: patient.bmi,
      dashboardSuggestions: patient.dashboardSuggestions || [],
    });
    setIsReadOnlyView(isReadOnly);
    setHba1cRecordsState(patient.hba1cRecords || []);
    setFastingBloodGlucoseRecordsState(patient.fastingBloodGlucoseRecords || []);
    setThyroidRecordsState(patient.thyroidRecords || []);
    setThyroxineRecordsState(patient.thyroxineRecords || []);
    setSerumCreatinineRecordsState(patient.serumCreatinineRecords || []);
    setUricAcidRecordsState(patient.uricAcidRecords || []);
    setHemoglobinRecordsState(patient.hemoglobinRecords || []);
    setWeightRecordsState(patient.weightRecords || []);
    setBloodPressureRecordsState(patient.bloodPressureRecords || []);
    setTotalCholesterolRecordsState(patient.totalCholesterolRecords || []);
    setLdlRecordsState(patient.ldlRecords || []);
    setHdlRecordsState(patient.hdlRecords || []);
    setTriglyceridesRecordsState(patient.triglyceridesRecords || []);
    
    setTips([]);
    setInsightsError(null);
    setIsGeneratingInsights(false);
    setIsTranslatingInsights(false);
    setSelectedInsightsLanguage('en');
    
    const countryInfo = countries.find(c => c.code === patient.country);
    setBiomarkerUnitState(countryInfo?.biomarkerUnit || 'conventional');
  }, []);

  const loadLocalPatientData = useCallback(() => {
    if (typeof window !== 'undefined') {
        const localDataString = localStorage.getItem('patientData');
        if (localDataString) {
            try {
                const patientData: Patient = JSON.parse(localDataString);
                setPatientData(patientData, false);
                return patientData;
            } catch (e) {
                console.error("Failed to parse local patient data", e);
                localStorage.removeItem('patientData');
            }
        }
    }
    return null;
  }, [setPatientData]);

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
    const getLatest = <T extends { date: string | Date }>(records: T[]) => [...records].sort((a,b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())[0];
    return {
        hba1c: getLatest(hba1cRecords)?.value,
        fastingBloodGlucose: getLatest(fastingBloodGlucoseRecords) ? getDisplayGlucoseValue(getLatest(fastingBloodGlucoseRecords)!.value) : undefined,
        weight: getLatest(weightRecords)?.value,
        bloodPressure: getLatest(bloodPressureRecords) ? { systolic: getLatest(bloodPressureRecords)!.systolic, diastolic: getLatest(bloodPressureRecords)!.diastolic } : undefined,
    }
  }, [hba1cRecords, fastingBloodGlucoseRecords, weightRecords, bloodPressureRecords, getDisplayGlucoseValue]);


  const regenerateInsights = useCallback(async (languageCode: string) => {
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
  

  const getMedicationForRecord = useCallback((medication: Medication[]): string => {
    if (!medication || !Array.isArray(medication) || medication.length === 0) return 'N/A';
    try {
      return JSON.stringify(medication.map(m => ({name: m.name, dosage: m.dosage, frequency: m.frequency})));
    } catch {
      return 'N/A';
    }
  }, []);

  const setProfile = useCallback((newProfile: UserProfile) => {
    const latestWeight = [...weightRecords].sort((a,b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())[0];
    const newBmi = calculateBmi(newProfile.height, latestWeight?.value);
    setProfileState({ ...newProfile, bmi: newBmi });
  }, [weightRecords]);
  
  const addMedicalCondition = useCallback((condition: MedicalCondition) => {
    setProfileState(prev => ({...prev, presentMedicalConditions: [...prev.presentMedicalConditions, condition]}));
  }, []);

  const updateMedicalCondition = useCallback((condition: MedicalCondition) => {
    setProfileState(prevProfile => ({ ...prevProfile, presentMedicalConditions: prevProfile.presentMedicalConditions.map(c => c.id === condition.id ? condition : c)}));
  }, []);
  
  const removeMedicalCondition = useCallback((id: string) => {
    setProfileState(prevProfile => ({ ...prevProfile, presentMedicalConditions: prevProfile.presentMedicalConditions.filter(c => c.id !== id)}));
  }, []);
  
   const addMedication = useCallback((medication: Omit<Medication, 'id'>) => {
    const newMedication = { ...medication, id: Date.now().toString() };
    setProfileState(prevProfile => ({ ...prevProfile, medication: [...prevProfile.medication.filter(m => m.name.toLowerCase() !== 'nil'), newMedication] }));
  }, []);

  const updateMedication = useCallback((medication: Medication) => {
    setProfileState(prevProfile => ({ ...prevProfile, medication: prevProfile.medication.map(m => m.id === medication.id ? medication : m)}));
  }, []);

  const removeMedication = useCallback((id: string) => {
    setProfileState(prevProfile => ({ ...prevProfile, medication: prevProfile.medication.filter(m => m.id !== id) }));
  }, []);

  const setMedicationNil = useCallback(() => {
      const nilMedication: Medication[] = [{ id: 'nil', name: 'Nil', brandName: 'Nil', dosage: '', frequency: '' }];
      setProfileState(prevProfile => ({ ...prevProfile, medication: nilMedication }));
  }, []);

  const addHba1cRecord = useCallback((record: Omit<Hba1cRecord, 'id' | 'medication'>) => {
    setHba1cRecordsState(prev => [...prev, { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) }]);
  }, [profile.medication, getMedicationForRecord]);

  const removeHba1cRecord = useCallback((id: string) => {
    setHba1cRecordsState(prev => prev.filter(r => r.id !== id));
  }, []);
  
  const addFastingBloodGlucoseRecord = useCallback((record: Omit<FastingBloodGlucoseRecord, 'id' | 'medication'>) => {
    setFastingBloodGlucoseRecordsState(prev => [...prev, { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) }]);
  }, [profile.medication, getMedicationForRecord]);

  const removeFastingBloodGlucoseRecord = useCallback((id: string) => {
    setFastingBloodGlucoseRecordsState(prev => prev.filter(r => r.id !== id));
  }, []);

  const addThyroidRecord = useCallback((record: Omit<ThyroidRecord, 'id' | 'medication'>) => {
    setThyroidRecordsState(prev => [...prev, { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) }]);
  }, [profile.medication, getMedicationForRecord]);

  const removeThyroidRecord = useCallback((id: string) => {
    setThyroidRecordsState(prev => prev.filter(r => r.id !== id));
  }, []);
  
  const addThyroxineRecord = useCallback((record: Omit<ThyroxineRecord, 'id' | 'medication'>) => {
    setThyroxineRecordsState(prev => [...prev, { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) }]);
  }, [profile.medication, getMedicationForRecord]);

  const removeThyroxineRecord = useCallback((id: string) => {
    setThyroxineRecordsState(prev => prev.filter(r => r.id !== id));
  }, []);
  
  const addSerumCreatinineRecord = useCallback((record: Omit<SerumCreatinineRecord, 'id' | 'medication'>) => {
    setSerumCreatinineRecordsState(prev => [...prev, { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) }]);
  }, [profile.medication, getMedicationForRecord]);

  const removeSerumCreatinineRecord = useCallback((id: string) => {
    setSerumCreatinineRecordsState(prev => prev.filter(r => r.id !== id));
  }, []);

  const addUricAcidRecord = useCallback((record: Omit<UricAcidRecord, 'id' | 'medication'>) => {
    setUricAcidRecordsState(prev => [...prev, { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) }]);
  }, [profile.medication, getMedicationForRecord]);

  const removeUricAcidRecord = useCallback((id: string) => {
    setUricAcidRecordsState(prev => prev.filter(r => r.id !== id));
  }, []);

  const addHemoglobinRecord = useCallback((record: Omit<HemoglobinRecord, 'id' | 'medication'>) => {
    setHemoglobinRecordsState(prev => [...prev, { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) }]);
  }, [profile.medication, getMedicationForRecord]);

  const removeHemoglobinRecord = useCallback((id: string) => {
    setHemoglobinRecordsState(prev => prev.filter(r => r.id !== id));
  }, []);
  
  const addWeightRecord = useCallback((record: Omit<WeightRecord, 'id'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString() };
    setWeightRecordsState(prev => [...prev, newRecord]);
    setProfileState(prev => ({...prev, bmi: calculateBmi(newRecord.value, prev.height) }));
  }, []);

  const removeWeightRecord = useCallback((id: string) => {
    setWeightRecordsState(prev => {
        const updatedRecords = prev.filter(r => r.id !== id);
        const newLatestRecord = [...updatedRecords].sort((a,b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())[0];
        setProfileState(p => ({...p, bmi: calculateBmi(newLatestRecord?.value, p.height) }));
        return updatedRecords;
    });
  }, []);
  
  const addBloodPressureRecord = useCallback((record: Omit<BloodPressureRecord, 'id' | 'medication'>) => {
    setBloodPressureRecordsState(prev => [...prev, { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) }]);
  }, [profile.medication, getMedicationForRecord]);

  const removeBloodPressureRecord = useCallback((id: string) => {
    setBloodPressureRecordsState(prev => prev.filter(r => r.id !== id));
  }, []);

  const addTotalCholesterolRecord = useCallback((record: Omit<TotalCholesterolRecord, 'id' | 'medication'>) => {
    setTotalCholesterolRecordsState(prev => [...prev, { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) }]);
  }, [profile.medication, getMedicationForRecord]);

  const removeTotalCholesterolRecord = useCallback((id: string) => {
    setTotalCholesterolRecordsState(prev => prev.filter(r => r.id !== id));
  }, []);

  const addLdlRecord = useCallback((record: Omit<LdlRecord, 'id' | 'medication'>) => {
    setLdlRecordsState(prev => [...prev, { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) }]);
  }, [profile.medication, getMedicationForRecord]);

  const removeLdlRecord = useCallback((id: string) => {
    setLdlRecordsState(prev => prev.filter(r => r.id !== id));
  }, []);
  
  const addHdlRecord = useCallback((record: Omit<HdlRecord, 'id' | 'medication'>) => {
    setHdlRecordsState(prev => [...prev, { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) }]);
  }, [profile.medication, getMedicationForRecord]);

  const removeHdlRecord = useCallback((id: string) => {
    setHdlRecordsState(prev => prev.filter(r => r.id !== id));
  }, []);

  const addTriglyceridesRecord = useCallback((record: Omit<TriglyceridesRecord, 'id' | 'medication'>) => {
    setTriglyceridesRecordsState(prev => [...prev, { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) }]);
  }, [profile.medication, getMedicationForRecord]);

  const removeTriglyceridesRecord = useCallback((id: string) => {
    setTriglyceridesRecordsState(prev => prev.filter(r => r.id !== id));
  }, []);

  const toggleDiseaseBiomarker = useCallback((panelKey: string, biomarkerKey: BiomarkerKey | string) => {
    setProfileState(prevProfile => {
        const currentEnabled = { ...(prevProfile.enabledBiomarkers || {}) };
        const panelBiomarkers = currentEnabled[panelKey] || [];
        
        const newPanelBiomarkers = panelBiomarkers.includes(biomarkerKey)
          ? panelBiomarkers.filter(b => b !== biomarkerKey)
          : [...panelBiomarkers, biomarkerKey];

        return {
          ...prevProfile,
          enabledBiomarkers: { ...currentEnabled, [panelKey]: newPanelBiomarkers }
        };
    });
  }, []);

  const toggleDiseasePanel = useCallback((panelKey: DiseasePanelKey) => {
    setProfileState(prevProfile => {
        const currentEnabled = { ...(prevProfile.enabledBiomarkers || {}) };
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
        
        return { ...prevProfile, enabledBiomarkers: updatedEnabledBiomarkers };
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

    setHba1cRecordsState(prev => {
        if (batch.hba1c?.value) {
            const exists = prev.some(r => startOfDay(parseISO(r.date as string)).getTime() === recordDate.getTime());
            if (!exists) { result.added.push('HbA1c'); return [...prev, { ...batch.hba1c, id: `hba1c-${Date.now()}`, date: recordDate.toISOString() }]; } 
            else { result.duplicates.push('HbA1c'); }
        }
        return prev;
    });

    setFastingBloodGlucoseRecordsState(prev => {
        if (batch.fastingBloodGlucose?.value) {
            const exists = prev.some(r => startOfDay(parseISO(r.date as string)).getTime() === recordDate.getTime());
            if (!exists) { result.added.push('Fasting Blood Glucose'); return [...prev, { ...batch.fastingBloodGlucose, id: `fbg-${Date.now()}`, date: recordDate.toISOString() }]; } 
            else { result.duplicates.push('Fasting Blood Glucose'); }
        }
        return prev;
    });
    
    setThyroidRecordsState(prev => {
        if (batch.thyroid?.tsh) {
            const exists = prev.some(r => startOfDay(parseISO(r.date as string)).getTime() === recordDate.getTime());
            if (!exists) { result.added.push('Thyroid'); return [...prev, { tsh: 0, t3: 0, t4: 0, ...batch.thyroid, id: `thyroid-${Date.now()}`, date: recordDate.toISOString() }]; } 
            else { result.duplicates.push('Thyroid'); }
        }
        return prev;
    });
    
    setBloodPressureRecordsState(prev => {
        if (batch.bloodPressure?.systolic && batch.bloodPressure?.diastolic) {
           const exists = prev.some(r => startOfDay(parseISO(r.date as string)).getTime() === recordDate.getTime());
           if (!exists) { result.added.push('Blood Pressure'); return [...prev, { ...batch.bloodPressure, id: `bp-${Date.now()}`, date: recordDate.toISOString() }]; } 
           else { result.duplicates.push('Blood Pressure'); }
        }
        return prev;
    });
    
    setHemoglobinRecordsState(prev => {
        if (batch.hemoglobin?.hemoglobin) {
           const exists = prev.some(r => startOfDay(parseISO(r.date as string)).getTime() === recordDate.getTime());
           if (!exists) { result.added.push('Hemoglobin'); return [...prev, { ...batch.hemoglobin, id: `anemia-${Date.now()}`, date: recordDate.toISOString() }]; } 
           else { result.duplicates.push('Hemoglobin'); }
        }
        return prev;
    });
    
    if (batch.lipidPanel) {
        setTotalCholesterolRecordsState(prev => {
            if (batch.lipidPanel?.totalCholesterol) {
                const exists = prev.some(r => startOfDay(parseISO(r.date as string)).getTime() === recordDate.getTime());
                if (!exists) { result.added.push('Total Cholesterol'); return [...prev, { value: batch.lipidPanel.totalCholesterol, id: `tc-${Date.now()}`, date: recordDate.toISOString() }]; } 
                else { result.duplicates.push('Total Cholesterol'); }
            }
            return prev;
        });
        setLdlRecordsState(prev => {
            if (batch.lipidPanel?.ldl) {
                const exists = prev.some(r => startOfDay(parseISO(r.date as string)).getTime() === recordDate.getTime());
                if (!exists) { result.added.push('LDL'); return [...prev, { value: batch.lipidPanel.ldl, id: `ldl-${Date.now()}`, date: recordDate.toISOString() }]; } 
                else { result.duplicates.push('LDL'); }
            }
            return prev;
        });
        setHdlRecordsState(prev => {
            if (batch.lipidPanel?.hdl) {
                const exists = prev.some(r => startOfDay(parseISO(r.date as string)).getTime() === recordDate.getTime());
                if (!exists) { result.added.push('HDL'); return [...prev, { value: batch.lipidPanel.hdl, id: `hdl-${Date.now()}`, date: recordDate.toISOString() }]; } 
                else { result.duplicates.push('HDL'); }
            }
            return prev;
        });
        setTriglyceridesRecordsState(prev => {
            if (batch.lipidPanel?.triglycerides) {
                const exists = prev.some(r => startOfDay(parseISO(r.date as string)).getTime() === recordDate.getTime());
                if (!exists) { result.added.push('Triglycerides'); return [...prev, { value: batch.lipidPanel.triglycerides, id: `trig-${Date.now()}`, date: recordDate.toISOString() }]; } 
                else { result.duplicates.push('Triglycerides'); }
            }
            return prev;
        });
    }
    
    return result;
  }, []);

  const setTheme = useCallback((theme: Theme) => {
    setThemeState(theme);
  }, []);

  const approveMedicalCondition = useCallback((conditionId: string) => {
    setProfileState(prev => {
        const newConditions = prev.presentMedicalConditions.map(c => c.id === conditionId ? { ...c, status: 'verified' } : c);
        toast({ title: 'Condition Approved', description: 'The medical condition has been marked as verified.' });
        return { ...prev, presentMedicalConditions: newConditions };
    });
  }, []);

  const dismissSuggestion = useCallback((conditionId: string) => {
    setProfileState(prev => {
        const newConditions = prev.presentMedicalConditions.map(c => c.id === conditionId ? { ...c, status: 'needs_revision' } : c);
        toast({ title: 'Condition Dismissed', description: 'The condition has been marked for patient revision.' });
        return { ...prev, presentMedicalConditions: newConditions };
    });
  }, []);

  const value: AppContextType = {
    profile,
    setProfile,
    getFullPatientData,
    hasLocalData,
    loadLocalPatientData,
    addMedicalCondition,
    updateMedicalCondition,
    removeMedicalCondition,
    addMedication,
    updateMedication,
    removeMedication,
    setMedicationNil,
    hba1cRecords,
    addHba1cRecord,
    removeHba1cRecord,
    fastingBloodGlucoseRecords,
    addFastingBloodGlucoseRecord,
    removeFastingBloodGlucoseRecord,
    thyroidRecords,
    addThyroidRecord,
    removeThyroidRecord,
    thyroxineRecords,
    addThyroxineRecord,
    removeThyroxineRecord,
    serumCreatinineRecords,
    addSerumCreatinineRecord,
    removeSerumCreatinineRecord,
    uricAcidRecords,
    addUricAcidRecord,
    removeUricAcidRecord,
    hemoglobinRecords,
    addHemoglobinRecord,
    removeHemoglobinRecord,
    weightRecords,
    addWeightRecord,
    removeWeightRecord,
    bloodPressureRecords,
    addBloodPressureRecord,
    removeBloodPressureRecord,
    totalCholesterolRecords,
    addTotalCholesterolRecord,
    removeTotalCholesterolRecord,
    ldlRecords,
    addLdlRecord,
    removeLdlRecord,
    hdlRecords,
    addHdlRecord,
    removeHdlRecord,
    triglyceridesRecords,
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
    setPatientData,
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
