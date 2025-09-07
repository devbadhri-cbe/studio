

'use client';

import { type Doctor, type UserProfile, type MedicalCondition, type Patient, type Medication, type VitaminDRecord, type ThyroidRecord, type WeightRecord, type BloodPressureRecord, UnitSystem, type HemoglobinRecord, type FastingBloodGlucoseRecord, type Hba1cRecord, DashboardSuggestion, type TotalCholesterolRecord, type LdlRecord, type HdlRecord, type TriglyceridesRecord, type CustomBiomarker, BiomarkerKey, DiseasePanelKey } from '@/lib/types';
import { useState, useEffect, createContext, useContext, useCallback, ReactNode } from 'react';
import { updatePatient } from '@/lib/firestore';
import { toast } from '@/hooks/use-toast';
import { startOfDay, parseISO, isValid } from 'date-fns';
import { countries } from '@/lib/countries';
import { toMmolL, toNgDl, toNmolL, toGDL, toGL, toMgDl } from '@/lib/unit-conversions';
import { calculateBmi } from '@/lib/utils';
import { getIcdCode } from '@/ai/flows/get-icd-code-flow';
import { availableDiseasePanels } from '@/lib/biomarker-cards';

const initialProfile: UserProfile = { id: '', name: 'User', dob: '', gender: 'other', country: 'US', dateFormat: 'MM-dd-yyyy', unitSystem: 'imperial', presentMedicalConditions: [], medication: [], enabledBiomarkers: {}, dashboardSuggestions: [] };

type DashboardView = 'vitaminD' | 'thyroid' | 'hypertension' | 'report' | 'none';
type Theme = 'dark' | 'light' | 'system';

export interface BatchRecords {
    hba1c?: Omit<Hba1cRecord, 'id' | 'medication'>;
    fastingBloodGlucose?: Omit<FastingBloodGlucoseRecord, 'id' | 'medication'>;
    vitaminD?: Omit<VitaminDRecord, 'id' | 'medication'> & { units?: string };
    thyroid?: Partial<Omit<ThyroidRecord, 'id' | 'medication'>>;
    bloodPressure?: Omit<BloodPressureRecord, 'id' | 'medication'>;
    hemoglobin?: Omit<HemoglobinRecord, 'id' | 'medication' | 'date'> & { date: string };
    lipidPanel?: Partial<Omit<TotalCholesterolRecord & LdlRecord & HdlRecord & TriglyceridesRecord, 'id' | 'medication'>>;
}


type BiomarkerUnitSystem = 'conventional' | 'si';

interface AddBatchRecordsResult {
    added: string[];
    duplicates: string[];
}

interface EnableDashboardResult {
  alreadyExists: boolean;
  name: string;
}

interface AppContextType {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  addMedicalCondition: (condition: Pick<MedicalCondition, 'condition' | 'date'>) => Promise<void>;
  updateMedicalCondition: (condition: MedicalCondition) => void;
  removeMedicalCondition: (id: string) => void;
  approveMedicalCondition: (conditionId: string) => void;
  dismissSuggestion: (conditionId: string) => void;
  addMedication: (medication: Omit<Medication, 'id'>) => void;
  removeMedication: (id: string) => void;
  setMedicationNil: () => void;
  hba1cRecords: Hba1cRecord[];
  addHba1cRecord: (record: Omit<Hba1cRecord, 'id' | 'medication'>) => void;
  removeHba1cRecord: (id: string) => void;
  fastingBloodGlucoseRecords: FastingBloodGlucoseRecord[];
  addFastingBloodGlucoseRecord: (record: Omit<FastingBloodGlucoseRecord, 'id' | 'medication'>) => void;
  removeFastingBloodGlucoseRecord: (id: string) => void;
  vitaminDRecords: VitaminDRecord[];
  addVitaminDRecord: (record: Omit<VitaminDRecord, 'id' | 'medication'>) => void;
  removeVitaminDRecord: (id: string) => void;
  thyroidRecords: ThyroidRecord[];
  addThyroidRecord: (record: Omit<ThyroidRecord, 'id' | 'medication'>) => void;
  removeThyroidRecord: (id: string) => void;
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
  customBiomarkers: CustomBiomarker[];
  addCustomBiomarker: (name: string, description?: string) => void;
  removeCustomBiomarker: (id: string) => void;
  addCustomBiomarkerRecord: (biomarkerId: string, record: Omit<CustomBiomarker['records'][0], 'id'>) => void;
  removeCustomBiomarkerRecord: (biomarkerId: string, recordId: string) => void;
  addBatchRecords: (records: BatchRecords) => Promise<AddBatchRecordsResult>;
  tips: string[];
  setTips: (tips: string[]) => void;
  isClient: boolean;
  dashboardView: DashboardView;
  setDashboardView: (view: DashboardView) => void;
  isDoctorLoggedIn: boolean;
  setIsDoctorLoggedIn: (isLoggedIn: boolean) => void;
  setPatientData: (patient: Patient) => void;
  biomarkerUnit: BiomarkerUnitSystem;
  setBiomarkerUnit: (unit: BiomarkerUnitSystem) => void;
  getDisplayVitaminDValue: (value: number) => number;
  getDisplayGlucoseValue: (value: number) => number;
  getDisplayHemoglobinValue: (value: number) => number;
  getDbVitaminDValue: (value: number) => number;
  getDbGlucoseValue: (value: number) => number;
  getDbHemoglobinValue: (value: number) => number;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  dashboardSuggestions: DashboardSuggestion[];
  toggleDiseaseBiomarker: (panelKey: string, biomarkerKey: BiomarkerKey | string) => void;
  toggleDiseasePanel: (panelKey: DiseasePanelKey) => void;
  hasUnsavedChanges: boolean;
  saveChanges: () => Promise<void>;
  isSaving: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile>(initialProfile);
  const [hba1cRecords, setHba1cRecordsState] = useState<Hba1cRecord[]>([]);
  const [fastingBloodGlucoseRecords, setFastingBloodGlucoseRecordsState] = useState<FastingBloodGlucoseRecord[]>([]);
  const [vitaminDRecords, setVitaminDRecordsState] = useState<VitaminDRecord[]>([]);
  const [thyroidRecords, setThyroidRecordsState] = useState<ThyroidRecord[]>([]);
  const [hemoglobinRecords, setHemoglobinRecordsState] = useState<HemoglobinRecord[]>([]);
  const [weightRecords, setWeightRecordsState] = useState<WeightRecord[]>([]);
  const [bloodPressureRecords, setBloodPressureRecordsState] = useState<BloodPressureRecord[]>([]);
  const [totalCholesterolRecords, setTotalCholesterolRecordsState] = useState<TotalCholesterolRecord[]>([]);
  const [ldlRecords, setLdlRecordsState] = useState<LdlRecord[]>([]);
  const [hdlRecords, setHdlRecordsState] = useState<LdlRecord[]>([]);
  const [triglyceridesRecords, setTriglyceridesRecordsState] = useState<TriglyceridesRecord[]>([]);
  const [customBiomarkers, setCustomBiomarkersState] = useState<CustomBiomarker[]>([]);
  const [tips, setTipsState] = useState<string[]>([]);
  const [dashboardView, setDashboardViewState] = useState<DashboardView>('report');
  const [isClient, setIsClient] = useState(false);
  const [isDoctorLoggedIn, setIsDoctorLoggedInState] = useState(false);
  const [theme, setThemeState] = useState<Theme>('system');
  const [biomarkerUnit, setBiomarkerUnitState] = useState<BiomarkerUnitSystem>('conventional');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
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
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }

    root.classList.add(effectiveTheme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ''; // This is required for Chrome
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);
  

  const setBiomarkerUnit = useCallback((unit: BiomarkerUnitSystem) => {
    setBiomarkerUnitState(unit);
  }, []);

  const getDisplayVitaminDValue = useCallback((value: number): number => {
      if (biomarkerUnit === 'si') {
          return parseFloat(toNmolL(value).toFixed(2));
      }
      return Math.round(value);
  }, [biomarkerUnit]);

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

  const getDbVitaminDValue = useCallback((value: number): number => {
    if (biomarkerUnit === 'si') {
        return toNgDl(value);
    }
    return value;
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
  
  const setIsDoctorLoggedIn = useCallback((isLoggedIn: boolean) => {
    setIsDoctorLoggedInState(isLoggedIn);
  }, []);
  
  const setPatientData = useCallback((patient: Patient) => {
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
      doctorName: patient.doctorName,
      dashboardSuggestions: patient.dashboardSuggestions || [],
    };
    setProfileState(patientProfile);
    setHba1cRecordsState(patient.hba1cRecords || []);
    setFastingBloodGlucoseRecordsState(patient.fastingBloodGlucoseRecords || []);
    setVitaminDRecordsState(patient.vitaminDRecords || []);
    setThyroidRecordsState(patient.thyroidRecords || []);
    setHemoglobinRecordsState(patient.hemoglobinRecords || []);
    setWeightRecordsState(patient.weightRecords || []);
    setBloodPressureRecordsState(patient.bloodPressureRecords || []);
    setTotalCholesterolRecordsState(patient.totalCholesterolRecords || []);
    setLdlRecordsState(patient.ldlRecords || []);
    setHdlRecordsState(patient.hdlRecords || []);
    setTriglyceridesRecordsState(patient.triglyceridesRecords || []);
    setCustomBiomarkersState(patient.customBiomarkers || []);
    setTipsState([]); 
    setDashboardViewState('report');
    setBiomarkerUnitState(countries.find(c => c.code === patient.country)?.biomarkerUnit || 'conventional');
    setHasUnsavedChanges(false);
  }, []);

  const saveChanges = useCallback(async () => {
    if (!profile.id || !hasUnsavedChanges) return;

    setIsSaving(true);
    try {
      const updates: Partial<Patient> = {
        ...profile,
        hba1cRecords,
        fastingBloodGlucoseRecords,
        vitaminDRecords,
        thyroidRecords,
        hemoglobinRecords,
        weightRecords,
        bloodPressureRecords,
        totalCholesterolRecords,
        ldlRecords,
        hdlRecords,
        triglyceridesRecords,
        customBiomarkers,
      };
      await updatePatient(profile.id, updates);
      setHasUnsavedChanges(false);
      toast({
        title: "Success!",
        description: "Your changes have been saved."
      });
    } catch(e) {
      console.error("Failed to save changes", e);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save your changes. Please try again."
      })
    } finally {
      setIsSaving(false);
    }
  }, [profile, hasUnsavedChanges, hba1cRecords, fastingBloodGlucoseRecords, vitaminDRecords, thyroidRecords, hemoglobinRecords, weightRecords, bloodPressureRecords, totalCholesterolRecords, ldlRecords, hdlRecords, triglyceridesRecords, customBiomarkers]);
  
  const getMedicationForRecord = useCallback((medication: Medication[]): string => {
    if (!medication || !Array.isArray(medication) || medication.length === 0) return 'N/A';
    try {
      return JSON.stringify(medication.map(m => ({name: m.name, dosage: m.dosage, frequency: m.frequency})));
    } catch {
      return 'N/A';
    }
  }, []);

  const setProfile = useCallback((newProfile: UserProfile) => {
      const newBmi = calculateBmi(profile.bmi, newProfile.height);
      setProfileState({...newProfile, bmi: newBmi});
      setHasUnsavedChanges(true);
  }, [profile.bmi]);
  
  const addMedicalCondition = useCallback(async (condition: Pick<MedicalCondition, 'condition' | 'date'>) => {
    try {
        const result = await getIcdCode({ conditionName: condition.condition });
        
        const newCondition: MedicalCondition = {
            id: `cond-${Date.now()}`,
            condition: result.standardizedName || condition.condition,
            date: condition.date,
            icdCode: result.icdCode || '',
            status: isDoctorLoggedIn ? 'verified' : 'pending_review'
        };

        const conditionLower = newCondition.condition.toLowerCase();
        let associatedPanel: DiseasePanelKey | undefined;

        if (conditionLower.includes('diabet') || conditionLower.includes('glucose')) {
            associatedPanel = 'diabetes';
        } else if (conditionLower.includes('hypertens') || conditionLower.includes('blood pressure')) {
            associatedPanel = 'hypertension';
        } else if (conditionLower.includes('lipid') || conditionLower.includes('cholesterol')) {
            associatedPanel = 'lipids';
        }

        let newEnabledBiomarkers = profile.enabledBiomarkers || {};
        let panelWasAdded = false;

        if (associatedPanel && isDoctorLoggedIn && !profile.enabledBiomarkers?.[associatedPanel]) {
            newEnabledBiomarkers = {
                ...newEnabledBiomarkers,
                [associatedPanel]: []
            };
            panelWasAdded = true;
        }

        const newProfileState: UserProfile = {
            ...profile,
            presentMedicalConditions: [...profile.presentMedicalConditions, newCondition],
            enabledBiomarkers: newEnabledBiomarkers,
        };
        
        // If a doctor adds a condition, save it immediately.
        if (isDoctorLoggedIn) {
            await updatePatient(profile.id, {
                presentMedicalConditions: newProfileState.presentMedicalConditions,
                enabledBiomarkers: newProfileState.enabledBiomarkers,
            });
            // Update local state after successful save
            setProfileState(newProfileState);
            
            if (panelWasAdded && associatedPanel) {
                const panelInfo = availableDiseasePanels.find(p => p.key === associatedPanel);
                toast({
                    title: 'Panel Enabled',
                    description: `The ${panelInfo?.label || 'related panel'} has been automatically enabled.`
                });
            }

        } else {
            // For patients, just update local state and let them save later.
            setProfileState(newProfileState);
            setHasUnsavedChanges(true);
        }

    } catch (error) {
        console.error("Failed to save condition", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not save medical condition. Please try again."
        });
    }
}, [isDoctorLoggedIn, profile]);


  const updateMedicalCondition = useCallback((condition: MedicalCondition) => {
    setProfileState(prevProfile => ({
      ...prevProfile,
      presentMedicalConditions: prevProfile.presentMedicalConditions.map(c => c.id === condition.id ? condition : c)
    }));
    setHasUnsavedChanges(true);
  }, []);
  
  const removeMedicalCondition = useCallback((id: string) => {
    setProfileState(prevProfile => ({
      ...prevProfile,
      presentMedicalConditions: prevProfile.presentMedicalConditions.filter(c => c.id !== id)
    }));
    setHasUnsavedChanges(true);
  }, []);
  
  const approveMedicalCondition = useCallback(async (conditionId: string) => {
    setProfileState(prevProfile => ({
      ...prevProfile,
      presentMedicalConditions: prevProfile.presentMedicalConditions.map(c => 
        c.id === conditionId ? { ...c, status: 'verified' as const } : c
      )
    }));
    setHasUnsavedChanges(true);
  }, []);
  
  const dismissSuggestion = useCallback((conditionId: string) => {
    setProfileState(prevProfile => ({
      ...prevProfile,
      presentMedicalConditions: prevProfile.presentMedicalConditions.map(c => 
        c.id === conditionId ? { ...c, status: 'needs_revision' as const } : c
      )
    }));
    setHasUnsavedChanges(true);
  }, []);

   const addMedication = useCallback((medication: Omit<Medication, 'id'>) => {
    const newMedication = { ...medication, id: Date.now().toString() };
    setProfileState(prevProfile => ({
      ...prevProfile,
      medication: [...prevProfile.medication.filter(m => m.name.toLowerCase() !== 'nil'), newMedication]
    }));
    setHasUnsavedChanges(true);
  }, []);

  const removeMedication = useCallback((id: string) => {
    setProfileState(prevProfile => ({
      ...prevProfile,
      medication: prevProfile.medication.filter(m => m.id !== id)
    }));
    setHasUnsavedChanges(true);
  }, []);

  const setMedicationNil = useCallback(() => {
      const nilMedication = [{ id: 'nil', name: 'Nil', dosage: '', frequency: '' }];
      setProfileState(prevProfile => ({ ...prevProfile, medication: nilMedication }));
      setHasUnsavedChanges(true);
  }, []);

  const addHba1cRecord = useCallback((record: Omit<Hba1cRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    setHba1cRecordsState(prev => [...prev, newRecord]);
    setHasUnsavedChanges(true);
  }, [profile.medication, getMedicationForRecord]);

  const removeHba1cRecord = useCallback((id: string) => {
    setHba1cRecordsState(prev => prev.filter(r => r.id !== id));
    setHasUnsavedChanges(true);
  }, []);
  
  const addFastingBloodGlucoseRecord = useCallback((record: Omit<FastingBloodGlucoseRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    setFastingBloodGlucoseRecordsState(prev => [...prev, newRecord]);
    setHasUnsavedChanges(true);
  }, [profile.medication, getMedicationForRecord]);

  const removeFastingBloodGlucoseRecord = useCallback((id: string) => {
    setFastingBloodGlucoseRecordsState(prev => prev.filter(r => r.id !== id));
    setHasUnsavedChanges(true);
  }, []);

  const addVitaminDRecord = useCallback((record: Omit<VitaminDRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    setVitaminDRecordsState(prev => [...prev, newRecord]);
    setHasUnsavedChanges(true);
  }, [profile.medication, getMedicationForRecord]);

  const removeVitaminDRecord = useCallback((id: string) => {
    setVitaminDRecordsState(prev => prev.filter(r => r.id !== id));
    setHasUnsavedChanges(true);
  }, []);

  const addThyroidRecord = useCallback((record: Omit<ThyroidRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    setThyroidRecordsState(prev => [...prev, newRecord]);
    setHasUnsavedChanges(true);
  }, [profile.medication, getMedicationForRecord]);

  const removeThyroidRecord = useCallback((id: string) => {
    setThyroidRecordsState(prev => prev.filter(r => r.id !== id));
    setHasUnsavedChanges(true);
  }, []);
  
  const addHemoglobinRecord = useCallback((record: Omit<HemoglobinRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    setHemoglobinRecordsState(prev => [...prev, newRecord]);
    setHasUnsavedChanges(true);
  }, [profile.medication, getMedicationForRecord]);

  const removeHemoglobinRecord = useCallback((id: string) => {
    setHemoglobinRecordsState(prev => prev.filter(r => r.id !== id));
    setHasUnsavedChanges(true);
  }, []);
  
  const addWeightRecord = useCallback((record: Omit<WeightRecord, 'id'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    setWeightRecordsState(prev => [...prev, newRecord]);
    
    const newBmi = calculateBmi(newRecord.value, profile.height);
    if(newBmi) {
        setProfileState(prevProfile => ({ ...prevProfile, bmi: newBmi }));
    }
    setHasUnsavedChanges(true);
  }, [profile.medication, profile.height, getMedicationForRecord]);

  const removeWeightRecord = useCallback((id: string) => {
    setWeightRecordsState(prev => prev.filter(r => r.id !== id));
    setHasUnsavedChanges(true);
  }, []);
  
  const addBloodPressureRecord = useCallback((record: Omit<BloodPressureRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    setBloodPressureRecordsState(prev => [...prev, newRecord]);
    setHasUnsavedChanges(true);
  }, [profile.medication, getMedicationForRecord]);

  const removeBloodPressureRecord = useCallback((id: string) => {
    setBloodPressureRecordsState(prev => prev.filter(r => r.id !== id));
    setHasUnsavedChanges(true);
  }, []);

  const addTotalCholesterolRecord = useCallback((record: Omit<TotalCholesterolRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    setTotalCholesterolRecordsState(prev => [...prev, newRecord]);
    setHasUnsavedChanges(true);
  }, [profile.medication, getMedicationForRecord]);

  const removeTotalCholesterolRecord = useCallback((id: string) => {
    setTotalCholesterolRecordsState(prev => prev.filter(r => r.id !== id));
    setHasUnsavedChanges(true);
  }, []);

  const addLdlRecord = useCallback((record: Omit<LdlRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    setLdlRecordsState(prev => [...prev, newRecord]);
    setHasUnsavedChanges(true);
  }, [profile.medication, getMedicationForRecord]);

  const removeLdlRecord = useCallback((id: string) => {
    setLdlRecordsState(prev => prev.filter(r => r.id !== id));
    setHasUnsavedChanges(true);
  }, []);

  const addHdlRecord = useCallback((record: Omit<HdlRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    setHdlRecordsState(prev => [...prev, newRecord]);
    setHasUnsavedChanges(true);
  }, [profile.medication, getMedicationForRecord]);

  const removeHdlRecord = useCallback((id: string) => {
    setHdlRecordsState(prev => prev.filter(r => r.id !== id));
    setHasUnsavedChanges(true);
  }, []);

  const addTriglyceridesRecord = useCallback((record: Omit<TriglyceridesRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    setTriglyceridesRecordsState(prev => [...prev, newRecord]);
    setHasUnsavedChanges(true);
  }, [profile.medication, getMedicationForRecord]);

  const removeTriglyceridesRecord = useCallback((id: string) => {
    setTriglyceridesRecordsState(prev => prev.filter(r => r.id !== id));
    setHasUnsavedChanges(true);
  }, []);
  
  const addCustomBiomarker = useCallback((name: string, description?: string) => {
    const newBiomarker: CustomBiomarker = {
      id: `custom-${Date.now()}`,
      name,
      description,
      records: [],
    };
    setCustomBiomarkersState(prev => [...prev, newBiomarker]);
    setHasUnsavedChanges(true);
  }, []);

  const removeCustomBiomarker = useCallback((id: string) => {
    setCustomBiomarkersState(prev => prev.filter(b => b.id !== id));
    setHasUnsavedChanges(true);
  }, []);
  
  const addCustomBiomarkerRecord = useCallback((biomarkerId: string, record: Omit<CustomBiomarker['records'][0], 'id'>) => {
    setCustomBiomarkersState(prev => prev.map(b => {
      if (b.id === biomarkerId) {
        const newRecord = { ...record, id: `record-${Date.now()}` };
        return { ...b, records: [...b.records, newRecord] };
      }
      return b;
    }));
    setHasUnsavedChanges(true);
  }, []);
  
  const removeCustomBiomarkerRecord = useCallback((biomarkerId: string, recordId: string) => {
    setCustomBiomarkersState(prev => prev.map(b => {
      if (b.id === biomarkerId) {
        const updatedRecords = b.records.filter(r => r.id !== recordId);
        return { ...b, records: updatedRecords };
      }
      return b;
    }));
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
  }, []);

  const toggleDiseasePanel = useCallback((panelKey: DiseasePanelKey) => {
    setProfileState(prevProfile => {
        const currentEnabled = { ...(prevProfile.enabledBiomarkers || {}) };
        const isEnabled = currentEnabled.hasOwnProperty(panelKey);
        const updatedEnabledBiomarkers = { ...currentEnabled };

        if (isEnabled) {
            delete updatedEnabledBiomarkers[panelKey];
        } else {
            updatedEnabledBiomarkers[panelKey] = [];
        }
        
        toast({
            title: isEnabled ? `Panel Disabled` : `Panel Enabled`,
            description: `The ${panelKey.charAt(0).toUpperCase() + panelKey.slice(1)} Panel has been ${isEnabled ? 'disabled' : 'enabled'} for this patient.`
        });

        return { ...prevProfile, enabledBiomarkers: updatedEnabledBiomarkers };
    });
    setHasUnsavedChanges(true);
  }, []);

  const addBatchRecords = useCallback(async (batch: BatchRecords): Promise<AddBatchRecordsResult> => {
    const newMedication = getMedicationForRecord(profile.medication);
    const date = batch.hba1c?.date || batch.fastingBloodGlucose?.date || batch.vitaminD?.date || batch.thyroid?.date || batch.bloodPressure?.date || batch.hemoglobin?.date || batch.lipidPanel?.date;

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

    setVitaminDRecordsState(prev => {
        if (batch.vitaminD && batch.vitaminD.value) {
          let vitDRecordForDb = { ...batch.vitaminD };
          if(batch.vitaminD.units && batch.vitaminD.units.toLowerCase().includes('nmol')) {
            vitDRecordForDb.value = toNgDl(batch.vitaminD.value);
          }
          
          const dateExists = prev.some(r => startOfDay(parseISO(r.date as string)).getTime() === newRecordDate.getTime() && r.value === vitDRecordForDb.value);
          if (!dateExists) {
            result.added.push('Vitamin D');
            return [...prev, { ...vitDRecordForDb, value: vitDRecordForDb.value, id: `vitd-${Date.now()}`, medication: newMedication, date: newRecordDate.toISOString() }];
          } else { result.duplicates.push('Vitamin D'); }
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
           const dateExists = prev.some(r => startOfDay(parseISO(r.date as string)).getTime() === newRecordDate.getTime() && r.systolic === batch.bloodPressure?.systolic);
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

    if (result.added.length > 0) {
        setHasUnsavedChanges(true);
    }
    
    return result;
  }, [profile.medication, getMedicationForRecord]);

  const setTips = useCallback((newTips: string[]) => {
    setTipsState(newTips);
  }, []);

  const setDashboardView = useCallback((view: DashboardView) => {
    setDashboardViewState(view);
  }, []);
  
  const setTheme = useCallback((theme: Theme) => {
    setThemeState(theme);
  }, []);

  const value: AppContextType = {
    profile,
    setProfile,
    addMedicalCondition,
    updateMedicalCondition,
    removeMedicalCondition,
    approveMedicalCondition,
    dismissSuggestion,
    addMedication,
    removeMedication,
    setMedicationNil,
    hba1cRecords,
    addHba1cRecord,
    removeHba1cRecord,
    fastingBloodGlucoseRecords,
    addFastingBloodGlucoseRecord,
    removeFastingBloodGlucoseRecord,
    vitaminDRecords,
    addVitaminDRecord,
    removeVitaminDRecord,
    thyroidRecords,
    addThyroidRecord,
    removeThyroidRecord,
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
    customBiomarkers,
    addCustomBiomarker,
    removeCustomBiomarker,
    addCustomBiomarkerRecord,
    removeCustomBiomarkerRecord,
    addBatchRecords,
    tips,
    setTips,
    isClient,
    dashboardView,
    setDashboardView,
    isDoctorLoggedIn,
    setIsDoctorLoggedIn,
    setPatientData,
    biomarkerUnit,
    setBiomarkerUnit,
    getDisplayVitaminDValue,
    getDisplayGlucoseValue,
    getDisplayHemoglobinValue,
    getDbVitaminDValue,
    getDbGlucoseValue,
    getDbHemoglobinValue,
    theme,
    setTheme,
    dashboardSuggestions: profile.dashboardSuggestions || [],
    toggleDiseaseBiomarker,
    toggleDiseasePanel,
    hasUnsavedChanges,
    saveChanges,
    isSaving,
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

    

    