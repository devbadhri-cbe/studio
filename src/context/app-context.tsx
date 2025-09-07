

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
  const [hdlRecords, setHdlRecordsState] = useState<HdlRecord[]>([]);
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
  

  const setBiomarkerUnit = (unit: BiomarkerUnitSystem) => {
    setBiomarkerUnitState(unit);
  }

  const getDisplayVitaminDValue = (value: number): number => {
      if (biomarkerUnit === 'si') {
          return parseFloat(toNmolL(value).toFixed(2));
      }
      return Math.round(value);
  }

  const getDisplayGlucoseValue = (value: number): number => {
      if (biomarkerUnit === 'si') {
          return parseFloat(toMmolL(value, 'glucose').toFixed(1));
      }
      return Math.round(value);
  }
  
  const getDisplayHemoglobinValue = (value: number): number => {
    if (biomarkerUnit === 'si') {
        return parseFloat(toGL(value).toFixed(1));
    }
    return parseFloat(value.toFixed(1));
  }

  const getDbVitaminDValue = (value: number): number => {
    if (biomarkerUnit === 'si') {
        return toNgDl(value);
    }
    return value;
  }

  const getDbGlucoseValue = (value: number): number => {
      if (biomarkerUnit === 'si') {
        return toMgDl(value, 'glucose');
      }
      return value;
  }
  
  const getDbHemoglobinValue = (value: number): number => {
    if (biomarkerUnit === 'si') {
        return toGDL(value);
    }
    return value;
  }
  
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

  const saveChanges = async () => {
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
  }
  
  const getMedicationForRecord = (medication: Medication[]): string => {
    if (!medication || !Array.isArray(medication) || medication.length === 0) return 'N/A';
    try {
      return JSON.stringify(medication.map(m => ({name: m.name, dosage: m.dosage, frequency: m.frequency})));
    } catch {
      return 'N/A';
    }
  }

  const setProfile = (newProfile: UserProfile) => {
      const newBmi = calculateBmi(profile.bmi, newProfile.height);
      setProfileState({...newProfile, bmi: newBmi});
      setHasUnsavedChanges(true);
  }
  
  const addMedicalCondition = async (condition: Pick<MedicalCondition, 'condition' | 'date'>) => {
    try {
      const result = await getIcdCode({ conditionName: condition.condition });
      
      const newCondition: MedicalCondition = {
        id: `cond-${Date.now()}`,
        condition: result.standardizedName || condition.condition,
        date: condition.date,
        icdCode: result.icdCode || '',
        status: isDoctorLoggedIn ? 'verified' : 'pending_review'
      };

      const newProfileState: UserProfile = {
        ...profile,
        presentMedicalConditions: [...profile.presentMedicalConditions, newCondition]
      };
      
      setProfileState(newProfileState);
      setHasUnsavedChanges(true);
      
      if (isDoctorLoggedIn) {
          approveMedicalCondition(newCondition.id);
      }


    } catch (error) {
        console.error("Failed to save condition", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not save medical condition. Please try again."
        });
    }
  };

  const updateMedicalCondition = (condition: MedicalCondition) => {
    const updatedConditions = profile.presentMedicalConditions.map(c => c.id === condition.id ? condition : c);
    const newProfileState = { ...profile, presentMedicalConditions: updatedConditions };
    setProfileState(newProfileState);
    setHasUnsavedChanges(true);
  };
  
  const removeMedicalCondition = (id: string) => {
    const updatedConditions = profile.presentMedicalConditions.filter(c => c.id !== id);
    const newProfileState = { ...profile, presentMedicalConditions: updatedConditions };
    setProfileState(newProfileState);
    setHasUnsavedChanges(true);
  };
  
  const approveMedicalCondition = async (conditionId: string) => {
    const updatedConditions = profile.presentMedicalConditions.map(c => {
        if (c.id === conditionId) {
            return { ...c, status: 'verified' as const };
        }
        return c;
    });

    const newProfileState = {...profile, presentMedicalConditions: updatedConditions };
    setProfileState(newProfileState);
    setHasUnsavedChanges(true);
  };
  
  const dismissSuggestion = (conditionId: string) => {
    const updatedConditions = profile.presentMedicalConditions.map(c => 
      c.id === conditionId ? { ...c, status: 'needs_revision' as const } : c
    );
    
    const newProfileState = {...profile, presentMedicalConditions: updatedConditions };
    setProfileState(newProfileState);
    setHasUnsavedChanges(true);
  };

   const addMedication = (medication: Omit<Medication, 'id'>) => {
    const newMedication = { ...medication, id: Date.now().toString() };
    const updatedMedication = [...profile.medication.filter(m => m.name.toLowerCase() !== 'nil'), newMedication];
    const newProfileState = { ...profile, medication: updatedMedication };
    setProfileState(newProfileState);
    setHasUnsavedChanges(true);
  };

  const removeMedication = (id: string) => {
    const updatedMedication = profile.medication.filter(m => m.id !== id);
    const newProfileState = { ...profile, medication: updatedMedication };
    setProfileState(newProfileState);
    setHasUnsavedChanges(true);
  };

  const setMedicationNil = () => {
      const nilMedication = [{ id: 'nil', name: 'Nil', dosage: '', frequency: '' }];
      const newProfileState = {...profile, medication: nilMedication};
      setProfileState(newProfileState);
      setHasUnsavedChanges(true);
  }

  const addHba1cRecord = (record: Omit<Hba1cRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    setHba1cRecordsState([...hba1cRecords, newRecord]);
    setHasUnsavedChanges(true);
  };

  const removeHba1cRecord = (id: string) => {
    const updatedRecords = hba1cRecords.filter(r => r.id !== id);
    setHba1cRecordsState(updatedRecords);
    setHasUnsavedChanges(true);
  };
  
  const addFastingBloodGlucoseRecord = (record: Omit<FastingBloodGlucoseRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    setFastingBloodGlucoseRecordsState([...fastingBloodGlucoseRecords, newRecord]);
    setHasUnsavedChanges(true);
  };

  const removeFastingBloodGlucoseRecord = (id: string) => {
    const updatedRecords = fastingBloodGlucoseRecords.filter(r => r.id !== id);
    setFastingBloodGlucoseRecordsState(updatedRecords);
    setHasUnsavedChanges(true);
  };

  const addVitaminDRecord = (record: Omit<VitaminDRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    setVitaminDRecordsState([...vitaminDRecords, newRecord]);
    setHasUnsavedChanges(true);
  };

  const removeVitaminDRecord = (id: string) => {
    const updatedRecords = vitaminDRecords.filter(r => r.id !== id);
    setVitaminDRecordsState(updatedRecords);
    setHasUnsavedChanges(true);
  };

  const addThyroidRecord = (record: Omit<ThyroidRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    setThyroidRecordsState([...thyroidRecords, newRecord]);
    setHasUnsavedChanges(true);
  };

  const removeThyroidRecord = (id: string) => {
    const updatedRecords = thyroidRecords.filter(r => r.id !== id);
    setThyroidRecordsState(updatedRecords);
    setHasUnsavedChanges(true);
  };
  
  const addHemoglobinRecord = (record: Omit<HemoglobinRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    setHemoglobinRecordsState([...hemoglobinRecords, newRecord]);
    setHasUnsavedChanges(true);
  };

  const removeHemoglobinRecord = (id: string) => {
    const updatedRecords = hemoglobinRecords.filter(r => r.id !== id);
    setHemoglobinRecordsState(updatedRecords);
    setHasUnsavedChanges(true);
  };
  
  const addWeightRecord = (record: Omit<WeightRecord, 'id'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    const updatedRecords = [...weightRecords, newRecord];
    setWeightRecordsState(updatedRecords);
    
    const newBmi = calculateBmi(newRecord.value, profile.height);
    if(newBmi) {
        setProfileState({
            ...profile,
            bmi: newBmi,
        });
    }
    setHasUnsavedChanges(true);
  };

  const removeWeightRecord = (id: string) => {
    const updatedRecords = weightRecords.filter(r => r.id !== id);
    setWeightRecordsState(updatedRecords);
    setHasUnsavedChanges(true);
  };
  
  const addBloodPressureRecord = (record: Omit<BloodPressureRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    setBloodPressureRecordsState([...bloodPressureRecords, newRecord]);
    setHasUnsavedChanges(true);
  };

  const removeBloodPressureRecord = (id: string) => {
    const updatedRecords = bloodPressureRecords.filter(r => r.id !== id);
    setBloodPressureRecordsState(updatedRecords);
    setHasUnsavedChanges(true);
  };

  const addTotalCholesterolRecord = (record: Omit<TotalCholesterolRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    setTotalCholesterolRecordsState([...totalCholesterolRecords, newRecord]);
    setHasUnsavedChanges(true);
  };

  const removeTotalCholesterolRecord = (id: string) => {
    const updatedRecords = totalCholesterolRecords.filter(r => r.id !== id);
    setTotalCholesterolRecordsState(updatedRecords);
    setHasUnsavedChanges(true);
  };

  const addLdlRecord = (record: Omit<LdlRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    setLdlRecordsState([...ldlRecords, newRecord]);
    setHasUnsavedChanges(true);
  };

  const removeLdlRecord = (id: string) => {
    const updatedRecords = ldlRecords.filter(r => r.id !== id);
    setLdlRecordsState(updatedRecords);
    setHasUnsavedChanges(true);
  };

  const addHdlRecord = (record: Omit<HdlRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    setHdlRecordsState([...hdlRecords, newRecord]);
    setHasUnsavedChanges(true);
  };

  const removeHdlRecord = (id: string) => {
    const updatedRecords = hdlRecords.filter(r => r.id !== id);
    setHdlRecordsState(updatedRecords);
    setHasUnsavedChanges(true);
  };

  const addTriglyceridesRecord = (record: Omit<TriglyceridesRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    setTriglyceridesRecordsState([...triglyceridesRecords, newRecord]);
    setHasUnsavedChanges(true);
  };

  const removeTriglyceridesRecord = (id: string) => {
    const updatedRecords = triglyceridesRecords.filter(r => r.id !== id);
    setTriglyceridesRecordsState(updatedRecords);
    setHasUnsavedChanges(true);
  };
  
  const addCustomBiomarker = (name: string, description?: string) => {
    const newBiomarker: CustomBiomarker = {
      id: `custom-${Date.now()}`,
      name,
      description,
      records: [],
    };
    setCustomBiomarkersState([...customBiomarkers, newBiomarker]);
    setHasUnsavedChanges(true);
  };

  const removeCustomBiomarker = (id: string) => {
    const updatedBiomarkers = customBiomarkers.filter(b => b.id !== id);
    setCustomBiomarkersState(updatedBiomarkers);
    setHasUnsavedChanges(true);
  };
  
  const addCustomBiomarkerRecord = (biomarkerId: string, record: Omit<CustomBiomarker['records'][0], 'id'>) => {
    const updatedBiomarkers = customBiomarkers.map(b => {
      if (b.id === biomarkerId) {
        const newRecord = { ...record, id: `record-${Date.now()}` };
        return { ...b, records: [...b.records, newRecord] };
      }
      return b;
    });
    setCustomBiomarkersState(updatedBiomarkers);
    setHasUnsavedChanges(true);
  };
  
  const removeCustomBiomarkerRecord = (biomarkerId: string, recordId: string) => {
    const updatedBiomarkers = customBiomarkers.map(b => {
      if (b.id === biomarkerId) {
        const updatedRecords = b.records.filter(r => r.id !== recordId);
        return { ...b, records: updatedRecords };
      }
      return b;
    });
    setCustomBiomarkersState(updatedBiomarkers);
    setHasUnsavedChanges(true);
  };

  const toggleDiseaseBiomarker = (panelKey: string, biomarkerKey: BiomarkerKey | string) => {
    const currentEnabled = { ...(profile.enabledBiomarkers || {}) };
    const panelBiomarkers = currentEnabled[panelKey] || [];
    
    const newPanelBiomarkers = panelBiomarkers.includes(biomarkerKey)
      ? panelBiomarkers.filter(b => b !== biomarkerKey)
      : [...panelBiomarkers, biomarkerKey];

    const updatedEnabledBiomarkers = {
      ...currentEnabled,
      [panelKey]: newPanelBiomarkers
    };
    
    const newProfileState = { ...profile, enabledBiomarkers: updatedEnabledBiomarkers };
    setProfileState(newProfileState);
    setHasUnsavedChanges(true);
  };

  const toggleDiseasePanel = (panelKey: DiseasePanelKey) => {
    const currentEnabled = { ...(profile.enabledBiomarkers || {}) };
    
    const isEnabled = currentEnabled.hasOwnProperty(panelKey);
    const updatedEnabledBiomarkers = { ...currentEnabled };

    if (isEnabled) {
        delete updatedEnabledBiomarkers[panelKey];
    } else {
        updatedEnabledBiomarkers[panelKey] = [];
    }
    
    const newProfileState = { ...profile, enabledBiomarkers: updatedEnabledBiomarkers };
    setProfileState(newProfileState);
    setHasUnsavedChanges(true);
    toast({
        title: isEnabled ? `Panel Disabled` : `Panel Enabled`,
        description: `The ${panelKey.charAt(0).toUpperCase() + panelKey.slice(1)} Panel has been ${isEnabled ? 'disabled' : 'enabled'} for this patient.`
    });
  }

  const addBatchRecords = async (batch: BatchRecords): Promise<AddBatchRecordsResult> => {
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

    if (batch.hba1c && batch.hba1c.value) {
      const dateExists = hba1cRecords.some(r => startOfDay(parseISO(r.date as string)).getTime() === newRecordDate.getTime() && r.value === batch.hba1c?.value);
      if (!dateExists) {
        const newRecord: Hba1cRecord = { ...batch.hba1c, id: `hba1c-${Date.now()}`, medication: newMedication, date: newRecordDate.toISOString() };
        setHba1cRecordsState(prev => [...prev, newRecord]);
        result.added.push('HbA1c');
      } else { result.duplicates.push('HbA1c'); }
    }

    if (batch.fastingBloodGlucose && batch.fastingBloodGlucose.value) {
      const dateExists = fastingBloodGlucoseRecords.some(r => startOfDay(parseISO(r.date as string)).getTime() === newRecordDate.getTime() && r.value === batch.fastingBloodGlucose?.value);
      if (!dateExists) {
        const newRecord: FastingBloodGlucoseRecord = { ...batch.fastingBloodGlucose, id: `fbg-${Date.now()}`, medication: newMedication, date: newRecordDate.toISOString() };
        setFastingBloodGlucoseRecordsState(prev => [...prev, newRecord]);
        result.added.push('Fasting Blood Glucose');
      } else { result.duplicates.push('Fasting Blood Glucose'); }
    }

    if (batch.vitaminD && batch.vitaminD.value) {
      let vitDRecordForDb = { ...batch.vitaminD };
      if(batch.vitaminD.units && batch.vitaminD.units.toLowerCase().includes('nmol')) {
        vitDRecordForDb.value = toNgDl(batch.vitaminD.value);
      }
      
      const dateExists = vitaminDRecords.some(r => startOfDay(parseISO(r.date as string)).getTime() === newRecordDate.getTime() && r.value === vitDRecordForDb.value);
      if (!dateExists) {
        const newRecord: VitaminDRecord = { ...vitDRecordForDb, value: vitDRecordForDb.value, id: `vitd-${Date.now()}`, medication: newMedication, date: newRecordDate.toISOString() };
        setVitaminDRecordsState(prev => [...prev, newRecord]);
        result.added.push('Vitamin D');
      } else { result.duplicates.push('Vitamin D'); }
    }
    
    if (batch.thyroid && batch.thyroid.tsh) {
        const dateExists = thyroidRecords.some(r => startOfDay(parseISO(r.date as string)).getTime() === newRecordDate.getTime() && r.tsh === batch.thyroid?.tsh);
        if (!dateExists) {
            const newRecord: ThyroidRecord = { tsh: 0, t3: 0, t4: 0, ...batch.thyroid, id: `thyroid-${Date.now()}`, medication: newMedication, date: newRecordDate.toISOString() };
            setThyroidRecordsState(prev => [...prev, newRecord]);
            result.added.push('Thyroid Panel');
        } else { result.duplicates.push('Thyroid Panel'); }
    }
    
    if (batch.bloodPressure && batch.bloodPressure.systolic && batch.bloodPressure.diastolic) {
       const dateExists = bloodPressureRecords.some(r => startOfDay(parseISO(r.date as string)).getTime() === newRecordDate.getTime() && r.systolic === batch.bloodPressure?.systolic);
       if (!dateExists) {
        const newRecord: BloodPressureRecord = { ...batch.bloodPressure, id: `bp-${Date.now()}`, medication: newMedication, date: newRecordDate.toISOString() };
        setBloodPressureRecordsState(prev => [...prev, newRecord]);
        result.added.push('Blood Pressure');
      } else { result.duplicates.push('Blood Pressure'); }
    }
    
    if (batch.hemoglobin && batch.hemoglobin.hemoglobin) {
       const dateExists = hemoglobinRecords.some(r => startOfDay(parseISO(r.date as string)).getTime() === newRecordDate.getTime() && r.hemoglobin === batch.hemoglobin?.hemoglobin);
       if (!dateExists) {
        const newRecord: HemoglobinRecord = { ...batch.hemoglobin, id: `anemia-${Date.now()}`, medication: newMedication, date: newRecordDate.toISOString() };
        setHemoglobinRecordsState(prev => [...prev, newRecord]);
        result.added.push('Hemoglobin');
      } else { result.duplicates.push('Hemoglobin'); }
    }
    
    if (batch.lipidPanel && batch.lipidPanel.totalCholesterol) {
       const dateExists = totalCholesterolRecords.some(r => startOfDay(parseISO(r.date as string)).getTime() === newRecordDate.getTime() && r.value === batch.lipidPanel?.totalCholesterol);
       if (!dateExists) {
        const newRecord: TotalCholesterolRecord = { value: batch.lipidPanel.totalCholesterol, id: `tc-${Date.now()}`, medication: newMedication, date: newRecordDate.toISOString() };
        setTotalCholesterolRecordsState(prev => [...prev, newRecord]);
        result.added.push('Total Cholesterol');
      } else { result.duplicates.push('Total Cholesterol'); }
    }

    if (batch.lipidPanel && batch.lipidPanel.ldl) {
        const dateExists = ldlRecords.some(r => startOfDay(parseISO(r.date as string)).getTime() === newRecordDate.getTime() && r.value === batch.lipidPanel?.ldl);
        if (!dateExists) {
            const newRecord: LdlRecord = { value: batch.lipidPanel.ldl, id: `ldl-${Date.now()}`, medication: newMedication, date: newRecordDate.toISOString() };
            setLdlRecordsState(prev => [...prev, newRecord]);
            result.added.push('LDL');
        } else { result.duplicates.push('LDL'); }
    }
    if (batch.lipidPanel && batch.lipidPanel.hdl) {
        const dateExists = hdlRecords.some(r => startOfDay(parseISO(r.date as string)).getTime() === newRecordDate.getTime() && r.value === batch.lipidPanel?.hdl);
        if (!dateExists) {
            const newRecord: HdlRecord = { value: batch.lipidPanel.hdl, id: `hdl-${Date.now()}`, medication: newMedication, date: newRecordDate.toISOString() };
            setHdlRecordsState(prev => [...prev, newRecord]);
            result.added.push('HDL');
        } else { result.duplicates.push('HDL'); }
    }
    if (batch.lipidPanel && batch.lipidPanel.triglycerides) {
        const dateExists = triglyceridesRecords.some(r => startOfDay(parseISO(r.date as string)).getTime() === newRecordDate.getTime() && r.value === batch.lipidPanel?.triglycerides);
        if (!dateExists) {
            const newRecord: TriglyceridesRecord = { value: batch.lipidPanel.triglycerides, id: `trig-${Date.now()}`, medication: newMedication, date: newRecordDate.toISOString() };
            setTriglyceridesRecordsState(prev => [...prev, newRecord]);
            result.added.push('Triglycerides');
        } else { result.duplicates.push('Triglycerides'); }
    }
    
    if (result.added.length > 0) {
        setHasUnsavedChanges(true);
    }
    
    return result;
  };

  const setTips = (newTips: string[]) => {
    setTipsState(newTips);
  };

  const setDashboardView = (view: DashboardView) => {
    setDashboardViewState(view);
  }

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
    setTheme: setThemeState,
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
