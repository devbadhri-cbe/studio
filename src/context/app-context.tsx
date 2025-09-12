
'use client';

import * as React from 'react';
import { type Doctor, type UserProfile, type MedicalCondition, type Patient, type Medication, type ThyroidRecord, type WeightRecord, type BloodPressureRecord, UnitSystem, type HemoglobinRecord, type FastingBloodGlucoseRecord, type Hba1cRecord, DashboardSuggestion, type TotalCholesterolRecord, type LdlRecord, type HdlRecord, type TriglyceridesRecord, BiomarkerKey, DiseasePanelKey, FoodInstruction, ThyroxineRecord, SerumCreatinineRecord, UricAcidRecord } from '@/lib/types';
import { useState, useEffect, createContext, useContext, useCallback, ReactNode } from 'react';
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

interface EnableDashboardResult {
  alreadyExists: boolean;
  name: string;
}

interface LipidRecordData {
    date: string | Date;
    totalCholesterol: number;
    ldl: number;
    hdl: number;
    triglycerides: number;
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
  hasLocalData: () => boolean;
  loadLocalPatientData: () => void;
  getFullPatientData: () => Patient;
  addMedicalCondition: (condition: MedicalCondition) => void;
  updateMedicalCondition: (condition: MedicalCondition) => void;
  removeMedicalCondition: (id: string) => void;
  removeAllMedicalConditions: () => Promise<void>;
  addMedication: (medication: Omit<Medication, 'id'>) => void;
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
  lipidRecords: (TotalCholesterolRecord & {ldl: number, hdl: number, triglycerides: number})[];
  addLipidRecord: (data: LipidRecordData) => void;
  removeLipidRecord: (id: string) => void;
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
  dashboardView: DashboardView;
  setDashboardView: (view: DashboardView) => void;
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
  dashboardSuggestions: DashboardSuggestion[];
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
  
  // State for insights card
  const [tips, setTips] = useState<string[]>([]);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [isTranslatingInsights, setIsTranslatingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [selectedInsightsLanguage, setSelectedInsightsLanguage] = React.useState('en');
  
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
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    let effectiveTheme = theme;
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      effectiveTheme = systemTheme;
    }
    
    root.classList.add(effectiveTheme);
    localStorage.setItem('theme', theme);
  }, [theme]);

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
  
  const saveAllData = useCallback(() => {
    if (isReadOnlyView) return;
    try {
        const fullData = getFullPatientData();
        localStorage.setItem('patientData', JSON.stringify(fullData));
    } catch (e) {
        console.error("Failed to save data to local storage", e);
        toast({
            variant: "destructive",
            title: "Save Error",
            description: "Could not save changes to your device."
        })
    }
  }, [getFullPatientData, isReadOnlyView]);

  useEffect(() => {
    saveAllData();
  }, [profile, hba1cRecords, fastingBloodGlucoseRecords, thyroidRecords, thyroxineRecords, serumCreatinineRecords, uricAcidRecords, hemoglobinRecords, weightRecords, bloodPressureRecords, totalCholesterolRecords, ldlRecords, hdlRecords, triglyceridesRecords, saveAllData]);

  const hasLocalData = useCallback(() => {
    if (typeof window !== 'undefined') {
        try {
            const data = localStorage.getItem('patientData');
            return data !== null && data.length > 0;
        } catch (e) {
            console.error("Could not access local storage:", e);
            return false;
        }
    }
    return false;
  }, []);


  const loadLocalPatientData = useCallback(() => {
    if (typeof window !== 'undefined') {
        const localDataString = localStorage.getItem('patientData');
        if (localDataString) {
            try {
                const patientData: Patient = JSON.parse(localDataString);
                setPatientData(patientData, false);
            } catch (e) {
                console.error("Failed to parse local patient data", e);
                localStorage.removeItem('patientData');
            }
        }
    }
  }, []);

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
  
  const setPatientData = useCallback((patient: Patient, isReadOnly: boolean = false) => {
    const patientProfile: UserProfile = {
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
    };
    setIsReadOnlyView(isReadOnly);
    setProfileState(patientProfile);
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

  const getMedicationForRecord = useCallback((medication: Medication[]): string => {
    if (!medication || !Array.isArray(medication) || medication.length === 0) return 'N/A';
    try {
      return JSON.stringify(medication.map(m => ({name: m.name, dosage: m.dosage, frequency: m.frequency})));
    } catch {
      return 'N/A';
    }
  }, []);

  const setProfile = useCallback((newProfile: UserProfile) => {
      const newBmi = calculateBmi(newProfile.height, newProfile.weightRecords?.[0]?.value);
      const updatedProfile = { ...newProfile, bmi: newBmi };
      setProfileState(updatedProfile);
  }, []);
  
  const addMedicalCondition = useCallback((condition: MedicalCondition) => {
    setProfileState(prev => ({
      ...prev,
      presentMedicalConditions: [...prev.presentMedicalConditions, condition]
    }));
  }, []);

  const updateMedicalCondition = useCallback((condition: MedicalCondition) => {
    setProfileState(prevProfile => ({
      ...prevProfile,
      presentMedicalConditions: prevProfile.presentMedicalConditions.map(c => c.id === condition.id ? condition : c)
    }));
  }, []);
  
  const removeMedicalCondition = useCallback((id: string) => {
    setProfileState(prevProfile => ({
      ...prevProfile,
      presentMedicalConditions: prevProfile.presentMedicalConditions.filter(c => c.id !== id)
    }));
  }, []);

  const removeAllMedicalConditions = useCallback(async () => {
    setProfileState(prevProfile => ({
      ...prevProfile,
      presentMedicalConditions: []
    }));
  }, []);
  
   const addMedication = useCallback((medication: Omit<Medication, 'id'>) => {
    const newMedication = { ...medication, id: Date.now().toString() };
    setProfileState(prevProfile => ({
      ...prevProfile,
      medication: [...prevProfile.medication.filter(m => m.name.toLowerCase() !== 'nil'), newMedication]
    }));
  }, []);

  const removeMedication = useCallback((id: string) => {
    setProfileState(prevProfile => ({
      ...prevProfile,
      medication: prevProfile.medication.filter(m => m.id !== id)
    }));
  }, []);

  const setMedicationNil = useCallback(() => {
      const nilMedication: Medication[] = [{ id: 'nil', name: 'Nil', brandName: 'Nil', dosage: '', frequency: '' }];
      setProfileState(prevProfile => ({ ...prevProfile, medication: nilMedication }));
  }, []);

  const addHba1cRecord = useCallback((record: Omit<Hba1cRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    setHba1cRecordsState(prev => [...prev, newRecord]);
  }, [profile.medication, getMedicationForRecord]);

  const removeHba1cRecord = useCallback((id: string) => {
    setHba1cRecordsState(prev => prev.filter(r => r.id !== id));
  }, []);
  
  const addFastingBloodGlucoseRecord = useCallback((record: Omit<FastingBloodGlucoseRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    setFastingBloodGlucoseRecordsState(prev => [...prev, newRecord]);
  }, [profile.medication, getMedicationForRecord]);

  const removeFastingBloodGlucoseRecord = useCallback((id: string) => {
    setFastingBloodGlucoseRecordsState(prev => prev.filter(r => r.id !== id));
  }, []);

  const addThyroidRecord = useCallback((record: Omit<ThyroidRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    setThyroidRecordsState(prev => [...prev, newRecord]);
  }, [profile.medication, getMedicationForRecord]);

  const removeThyroidRecord = useCallback((id: string) => {
    setThyroidRecordsState(prev => prev.filter(r => r.id !== id));
  }, []);
  
  const addThyroxineRecord = useCallback((record: Omit<ThyroxineRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    setThyroxineRecordsState(prev => [...prev, newRecord]);
  }, [profile.medication, getMedicationForRecord]);

  const removeThyroxineRecord = useCallback((id: string) => {
    setThyroxineRecordsState(prev => prev.filter(r => r.id !== id));
  }, []);
  
  const addSerumCreatinineRecord = useCallback((record: Omit<SerumCreatinineRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    setSerumCreatinineRecordsState(prev => [...prev, newRecord]);
  }, [profile.medication, getMedicationForRecord]);

  const removeSerumCreatinineRecord = useCallback((id: string) => {
    setSerumCreatinineRecordsState(prev => prev.filter(r => r.id !== id));
  }, []);

  const addUricAcidRecord = useCallback((record: Omit<UricAcidRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    setUricAcidRecordsState(prev => [...prev, newRecord]);
  }, [profile.medication, getMedicationForRecord]);

  const removeUricAcidRecord = useCallback((id: string) => {
    setUricAcidRecordsState(prev => prev.filter(r => r.id !== id));
  }, []);

  const addHemoglobinRecord = useCallback((record: Omit<HemoglobinRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    setHemoglobinRecordsState(prev => [...prev, newRecord]);
  }, [profile.medication, getMedicationForRecord]);

  const removeHemoglobinRecord = useCallback((id: string) => {
    setHemoglobinRecordsState(prev => prev.filter(r => r.id !== id));
  }, []);
  
  const addWeightRecord = useCallback((record: Omit<WeightRecord, 'id'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    setWeightRecordsState(prev => [...prev, newRecord]);
    
    const newBmi = calculateBmi(newRecord.value, profile.height);
    if(newBmi) {
        setProfileState(prevProfile => ({ ...prevProfile, bmi: newBmi }));
    }
  }, [profile.medication, profile.height, getMedicationForRecord]);

  const removeWeightRecord = useCallback((id: string) => {
    const updatedRecords = weightRecords.filter(r => r.id !== id);
    setWeightRecordsState(updatedRecords);

    const newLatestRecord = [...updatedRecords].sort((a,b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())[0];
    const newBmi = calculateBmi(newLatestRecord?.value, profile.height);
    setProfileState(prev => ({ ...prev, bmi: newBmi || prev.bmi }));
  }, [weightRecords, profile.height]);
  
  const addBloodPressureRecord = useCallback((record: Omit<BloodPressureRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    setBloodPressureRecordsState(prev => [...prev, newRecord]);
  }, [profile.medication, getMedicationForRecord]);

  const removeBloodPressureRecord = useCallback((id: string) => {
    setBloodPressureRecordsState(prev => prev.filter(r => r.id !== id));
  }, []);

  const addLipidRecord = useCallback((data: LipidRecordData) => {
    const recordMedication = getMedicationForRecord(profile.medication);
    const recordDate = new Date(data.date).toISOString();
    const recordId = Date.now().toString();

    setTotalCholesterolRecordsState(prev => [...prev, {id: `tc-${recordId}`, date: recordDate, value: data.totalCholesterol, medication: recordMedication}]);
    setLdlRecordsState(prev => [...prev, {id: `ldl-${recordId}`, date: recordDate, value: data.ldl, medication: recordMedication}]);
    setHdlRecordsState(prev => [...prev, {id: `hdl-${recordId}`, date: recordDate, value: data.hdl, medication: recordMedication}]);
    setTriglyceridesRecordsState(prev => [...prev, {id: `trig-${recordId}`, date: recordDate, value: data.triglycerides, medication: recordMedication}]);

  }, [profile.medication, getMedicationForRecord]);

  const removeLipidRecord = useCallback((id: string) => {
    const baseId = id.split('-').slice(1).join('-');
    setTotalCholesterolRecordsState(prev => prev.filter(r => !r.id.endsWith(baseId)));
    setLdlRecordsState(prev => prev.filter(r => !r.id.endsWith(baseId)));
    setHdlRecordsState(prev => prev.filter(r => !r.id.endsWith(baseId)));
    setTriglyceridesRecordsState(prev => prev.filter(r => !r.id.endsWith(baseId)));
  }, []);

  const addTotalCholesterolRecord = useCallback((record: Omit<TotalCholesterolRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    setTotalCholesterolRecordsState(prev => [...prev, newRecord]);
  }, [profile.medication, getMedicationForRecord]);

  const removeTotalCholesterolRecord = useCallback((id: string) => {
    setTotalCholesterolRecordsState(prev => prev.filter(r => r.id !== id));
  }, []);

  const addLdlRecord = useCallback((record: Omit<LdlRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    setLdlRecordsState(prev => [...prev, newRecord]);
  }, [profile.medication, getMedicationForRecord]);

  const removeLdlRecord = useCallback((id: string) => {
    setLdlRecordsState(prev => prev.filter(r => r.id !== id));
  }, []);
  
  const addHdlRecord = useCallback((record: Omit<HdlRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    setHdlRecordsState(prev => [...prev, newRecord]);
  }, [profile.medication, getMedicationForRecord]);

  const removeHdlRecord = useCallback((id: string) => {
    setHdlRecordsState(prev => prev.filter(r => r.id !== id));
  }, []);

  const addTriglyceridesRecord = useCallback((record: Omit<TriglyceridesRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    setTriglyceridesRecordsState(prev => [...prev, newRecord]);
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
    const currentEnabled = { ...(profile.enabledBiomarkers || {}) };
    const isCurrentlyEnabled = currentEnabled.hasOwnProperty(panelKey);
    const updatedEnabledBiomarkers = { ...currentEnabled };

    if (isCurrentlyEnabled) {
      delete updatedEnabledBiomarkers[panelKey];
    } else {
      updatedEnabledBiomarkers[panelKey] = [];
    }

    setProfileState(prevProfile => ({
      ...prevProfile,
      enabledBiomarkers: updatedEnabledBiomarkers,
    }));
    
    const panelInfo = availableDiseasePanels.find(p => p.key === panelKey);
    const panelName = panelInfo?.label || (panelKey.charAt(0).toUpperCase() + panelKey.slice(1) + ' Panel');
    
    toast({
        title: isCurrentlyEnabled ? `Panel Disabled` : `Panel Enabled`,
        description: `The ${panelName} has been ${isCurrentlyEnabled ? 'disabled' : 'enabled'} for this patient.`
    });

  }, [profile.enabledBiomarkers]);

  const addBatchRecords = useCallback(async (batch: BatchRecords): Promise<AddBatchRecordsResult> => {
    const newMedication = getMedicationForRecord(profile.medication);
    const date = batch.hba1c?.date || batch.fastingBloodGlucose?.date || batch.thyroid?.date || batch.bloodPressure?.date || batch.hemoglobin?.date || batch.lipidPanel?.date;

    const result: AddBatchRecordsResult = { added: [], duplicates: [] };

    if (!date) {
      toast({
        variant: "destructive",
        title: "Missing Date",
        description: "The uploaded document must contain a valid test date."
      })
      return result;
    };
    
    const newRecordDate = startOfDay(new Date(date));

    setHba1cRecordsState(prev => {
        if (batch.hba1c && batch.hba1c.value) {
            const dateExists = prev.some(r => startOfDay(parseISO(r.date as string)).getTime() === newRecordDate.getTime() && r.value === batch.hba1c?.value);
            if (!dateExists) {
                result.added.push('HbA1c');
                return [...prev, { ...batch.hba1c, id: `hba1c-${Date.now()}`, medication: newMedication, date: newRecordDate.toISOString() }];
            } else { result.duplicates.push('HbA1c'); }
        }
        return prev;
    });

    setFastingBloodGlucoseRecordsState(prev => {
        if (batch.fastingBloodGlucose && batch.fastingBloodGlucose.value) {
            const dateExists = prev.some(r => startOfDay(parseISO(r.date as string)).getTime() === newRecordDate.getTime() && r.value === batch.fastingBloodGlucose?.value);
            if (!dateExists) {
                result.added.push('Fasting Blood Glucose');
                return [...prev, { ...batch.fastingBloodGlucose, id: `fbg-${Date.now()}`, medication: newMedication, date: newRecordDate.toISOString() }];
            } else { result.duplicates.push('Fasting Blood Glucose'); }
        }
        return prev;
    });
    
    setThyroidRecordsState(prev => {
        if (batch.thyroid && batch.thyroid.tsh) {
            const dateExists = prev.some(r => startOfDay(parseISO(r.date as string)).getTime() === newRecordDate.getTime() && r.tsh === batch.thyroid?.tsh);
            if (!dateExists) {
                result.added.push('Thyroid Panel');
                return [...prev, { tsh: 0, t3: 0, t4: 0, ...batch.thyroid, id: `thyroid-${Date.now()}`, medication: newMedication, date: newRecordDate.toISOString() }];
            } else { result.duplicates.push('Thyroid Panel'); }
        }
        return prev;
    });
    
    setBloodPressureRecordsState(prev => {
        if (batch.bloodPressure && batch.bloodPressure.systolic && batch.bloodPressure.diastolic) {
           const dateExists = prev.some(r => startOfDay(parseISO(r.date as string)).getTime() === newRecordDate.getTime() && r.systolic === batch.bloodPressure?.systolic && r.diastolic === batch.bloodPressure?.diastolic);
           if (!dateExists) {
            result.added.push('Blood Pressure');
            return [...prev, { ...batch.bloodPressure, id: `bp-${Date.now()}`, medication: newMedication, date: newRecordDate.toISOString() }];
          } else { result.duplicates.push('Blood Pressure'); }
        }
        return prev;
    });
    
    setHemoglobinRecordsState(prev => {
        if (batch.hemoglobin && batch.hemoglobin.hemoglobin) {
           const dateExists = prev.some(r => startOfDay(parseISO(r.date as string)).getTime() === newRecordDate.getTime() && r.hemoglobin === batch.hemoglobin?.hemoglobin);
           if (!dateExists) {
            result.added.push('Hemoglobin');
            return [...prev, { ...batch.hemoglobin, id: `anemia-${Date.now()}`, medication: newMedication, date: newRecordDate.toISOString() }];
          } else { result.duplicates.push('Hemoglobin'); }
        }
        return prev;
    });
    
    if (batch.lipidPanel) {
        setTotalCholesterolRecordsState(prev => {
            if (batch.lipidPanel?.totalCholesterol) {
                const dateExists = prev.some(r => startOfDay(parseISO(r.date as string)).getTime() === newRecordDate.getTime() && r.value === batch.lipidPanel?.totalCholesterol);
                if (!dateExists) {
                    result.added.push('Total Cholesterol');
                    return [...prev, { value: batch.lipidPanel.totalCholesterol, id: `tc-${Date.now()}`, medication: newMedication, date: newRecordDate.toISOString() }];
                } else { result.duplicates.push('Total Cholesterol'); }
            }
            return prev;
        });
        setLdlRecordsState(prev => {
            if (batch.lipidPanel?.ldl) {
                const dateExists = prev.some(r => startOfDay(parseISO(r.date as string)).getTime() === newRecordDate.getTime() && r.value === batch.lipidPanel?.ldl);
                if (!dateExists) {
                    result.added.push('LDL');
                    return [...prev, { value: batch.lipidPanel.ldl, id: `ldl-${Date.now()}`, medication: newMedication, date: newRecordDate.toISOString() }];
                } else { result.duplicates.push('LDL'); }
            }
            return prev;
        });
        setHdlRecordsState(prev => {
            if (batch.lipidPanel?.hdl) {
                const dateExists = prev.some(r => startOfDay(parseISO(r.date as string)).getTime() === newRecordDate.getTime() && r.value === batch.lipidPanel?.hdl);
                if (!dateExists) {
                    result.added.push('HDL');
                    return [...prev, { value: batch.lipidPanel.hdl, id: `hdl-${Date.now()}`, medication: newMedication, date: newRecordDate.toISOString() }];
                } else { result.duplicates.push('HDL'); }
            }
            return prev;
        });
        setTriglyceridesRecordsState(prev => {
            if (batch.lipidPanel?.triglycerides) {
                const dateExists = prev.some(r => startOfDay(parseISO(r.date as string)).getTime() === newRecordDate.getTime() && r.value === batch.lipidPanel?.triglycerides);
                if (!dateExists) {
                    result.added.push('Triglycerides');
                    return [...prev, { value: batch.lipidPanel.triglycerides, id: `trig-${Date.now()}`, medication: newMedication, date: newRecordDate.toISOString() }];
                } else { result.duplicates.push('Triglycerides'); }
            }
            return prev;
        });
    }

    return result;
  }, [profile.medication, getMedicationForRecord]);

  const setTheme = useCallback((theme: Theme) => {
    setThemeState(theme);
  }, []);
  
  const lipidRecords = React.useMemo(() => {
    const combined = totalCholesterolRecords.map(tc => {
        const ldl = ldlRecords.find(r => r.date === tc.date);
        const hdl = hdlRecords.find(r => r.date === tc.date);
        const trig = triglyceridesRecords.find(r => r.date === tc.date);
        return {
            ...tc,
            ldl: ldl?.value || 0,
            hdl: hdl?.value || 0,
            triglycerides: trig?.value || 0,
        }
    });
    return combined;
  }, [totalCholesterolRecords, ldlRecords, hdlRecords, triglyceridesRecords]);

  const approveMedicalCondition = useCallback((conditionId: string) => {
    setProfileState(prev => ({
        ...prev,
        presentMedicalConditions: prev.presentMedicalConditions.map(c => 
            c.id === conditionId ? { ...c, status: 'verified' } : c
        ),
    }));
    toast({ title: 'Condition Approved', description: 'The medical condition has been marked as verified.' });
  }, []);

  const dismissSuggestion = useCallback((conditionId: string) => {
    setProfileState(prev => ({
      ...prev,
      presentMedicalConditions: prev.presentMedicalConditions.map(c => 
        c.id === conditionId ? { ...c, status: 'needs_revision' } : c
      ),
    }));
    toast({ title: 'Condition Dismissed', description: 'The condition has been marked for patient revision.' });
  }, []);

  const value: AppContextType = {
    profile,
    setProfile,
    hasLocalData,
    loadLocalPatientData,
    getFullPatientData,
    addMedicalCondition,
    updateMedicalCondition,
    removeMedicalCondition,
    removeAllMedicalConditions,
    addMedication,
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
    lipidRecords,
    addLipidRecord,
    removeLipidRecord,
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
    dashboardView: 'report',
    setDashboardView: () => {},
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
    dashboardSuggestions: profile.dashboardSuggestions || [],
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
