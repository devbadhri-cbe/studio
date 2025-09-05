

'use client';

import { type Doctor, type UserProfile, type LipidRecord, type MedicalCondition, type Patient, type Medication, type VitaminDRecord, type ThyroidRecord, type WeightRecord, type BloodPressureRecord, type RenalRecord, UnitSystem, type ElectrolyteRecord, type MineralBoneDiseaseRecord, type HemoglobinRecord, type NutritionRecord, type FastingBloodGlucoseRecord, CustomBiomarker, type Hba1cRecord } from '@/lib/types';
import * as React from 'react';
import { updatePatient } from '@/lib/firestore';
import { toast } from '@/hooks/use-toast';
import { startOfDay, parseISO, isValid } from 'date-fns';
import { countries } from '@/lib/countries';
import { toMgDl, toMmolL, toNgDl, toNmolL, toGDL, toGL } from '@/lib/unit-conversions';
import { calculateBmi, calculateEgfr } from '@/lib/utils';
import { suggestIcdCode } from '@/ai/flows/suggest-icd-code';


const initialProfile: UserProfile = { id: '', name: 'User', dob: '', gender: 'other', country: 'US', dateFormat: 'MM-dd-yyyy', unitSystem: 'imperial', presentMedicalConditions: [], medication: [], enabledDashboards: ['lipids', 'vitaminD', 'thyroid', 'hypertension', 'renal'], customBiomarkers: [] };

type DashboardView = 'lipids' | 'vitaminD' | 'thyroid' | 'hypertension' | 'renal' | 'report' | 'none';
type Theme = 'dark' | 'light' | 'system';

interface BatchRecords {
    hba1c?: Omit<Hba1cRecord, 'id' | 'medication'>;
    fastingBloodGlucose?: Omit<FastingBloodGlucoseRecord, 'id' | 'medication'>;
    lipid?: Omit<LipidRecord, 'id' | 'medication'> & { units?: 'mg/dL' | 'mmol/L' };
    vitaminD?: Omit<VitaminDRecord, 'id' | 'medication'> & { units?: 'ng/mL' | 'nmol/L' };
    thyroid?: Omit<ThyroidRecord, 'id' | 'medication'>;
    bloodPressure?: Omit<BloodPressureRecord, 'id' | 'medication'>;
    renal?: Omit<RenalRecord, 'id' | 'medication'>;
    electrolytes?: Omit<ElectrolyteRecord, 'id' | 'medication'>;
    mineralBone?: Omit<MineralBoneDiseaseRecord, 'id' | 'medication'>;
    hemoglobin?: number;
    albumin?: number;
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
  addMedicalCondition: (condition: Partial<Omit<MedicalCondition, 'id' | 'status'>> & {condition: string, date: string}, isPatientAdding: boolean) => void;
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
  lipidRecords: LipidRecord[];
  addLipidRecord: (record: Omit<LipidRecord, 'id' | 'medication'>) => void;
  removeLipidRecord: (id: string) => void;
  vitaminDRecords: VitaminDRecord[];
  addVitaminDRecord: (record: Omit<VitaminDRecord, 'id' | 'medication'>) => void;
  removeVitaminDRecord: (id: string) => void;
  thyroidRecords: ThyroidRecord[];
  addThyroidRecord: (record: Omit<ThyroidRecord, 'id' | 'medication'>) => void;
  removeThyroidRecord: (id: string) => void;
  renalRecords: RenalRecord[];
  addRenalRecord: (record: Omit<RenalRecord, 'id' | 'medication'>) => void;
  removeRenalRecord: (id: string) => void;
  electrolyteRecords: ElectrolyteRecord[];
  addElectrolyteRecord: (record: Omit<ElectrolyteRecord, 'id' | 'medication'>) => void;
  removeElectrolyteRecord: (id: string) => void;
  mineralBoneDiseaseRecords: MineralBoneDiseaseRecord[];
  addMineralBoneDiseaseRecord: (record: Omit<MineralBoneDiseaseRecord, 'id' | 'medication'>) => void;
  removeMineralBoneDiseaseRecord: (id: string) => void;
  hemoglobinRecords: HemoglobinRecord[];
  addHemoglobinRecord: (record: Omit<HemoglobinRecord, 'id' | 'medication'>) => void;
  removeHemoglobinRecord: (id: string) => void;
  nutritionRecords: NutritionRecord[];
  addNutritionRecord: (record: Omit<NutritionRecord, 'id' | 'medication'>) => void;
  removeNutritionRecord: (id: string) => void;
  weightRecords: WeightRecord[];
  addWeightRecord: (record: Omit<WeightRecord, 'id'>) => void;
  removeWeightRecord: (id: string) => void;
  bloodPressureRecords: BloodPressureRecord[];
  addBloodPressureRecord: (record: Omit<BloodPressureRecord, 'id' | 'medication'>) => void;
  removeBloodPressureRecord: (id: string) => void;
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
  getDisplayLipidValue: (value: number, type: 'ldl' | 'hdl' | 'total' | 'triglycerides') => number;
  getDisplayVitaminDValue: (value: number) => number;
  getDisplayGlucoseValue: (value: number) => number;
  getDisplayHemoglobinValue: (value: number) => number;
  getDbLipidValue: (value: number, type: 'ldl' | 'hdl' | 'total' | 'triglycerides') => number;
  getDbVitaminDValue: (value: number) => number;
  getDbGlucoseValue: (value: number) => number;
  getDbHemoglobinValue: (value: number) => number;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  dashboardSuggestions: [];
  enableDashboard: (dashboardKey: string) => EnableDashboardResult;
  customBiomarkers: CustomBiomarker[];
  addCustomBiomarker: (name: string) => Promise<void>;
  removeCustomBiomarker: (id: string) => void;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = React.useState<UserProfile>(initialProfile);
  const [hba1cRecords, setHba1cRecordsState] = React.useState<Hba1cRecord[]>([]);
  const [fastingBloodGlucoseRecords, setFastingBloodGlucoseRecordsState] = React.useState<FastingBloodGlucoseRecord[]>([]);
  const [lipidRecords, setLipidRecordsState] = React.useState<LipidRecord[]>([]);
  const [vitaminDRecords, setVitaminDRecordsState] = React.useState<VitaminDRecord[]>([]);
  const [thyroidRecords, setThyroidRecordsState] = React.useState<ThyroidRecord[]>([]);
  const [renalRecords, setRenalRecordsState] = React.useState<RenalRecord[]>([]);
  const [electrolyteRecords, setElectrolyteRecordsState] = React.useState<ElectrolyteRecord[]>([]);
  const [mineralBoneDiseaseRecords, setMineralBoneDiseaseRecordsState] = React.useState<MineralBoneDiseaseRecord[]>([]);
  const [hemoglobinRecords, setHemoglobinRecordsState] = React.useState<HemoglobinRecord[]>([]);
  const [nutritionRecords, setNutritionRecordsState] = React.useState<NutritionRecord[]>([]);
  const [weightRecords, setWeightRecordsState] = React.useState<WeightRecord[]>([]);
  const [bloodPressureRecords, setBloodPressureRecordsState] = React.useState<BloodPressureRecord[]>([]);
  const [tips, setTipsState] = React.useState<string[]>([]);
  const [dashboardView, setDashboardViewState] = React.useState<DashboardView>('report');
  const [isClient, setIsClient] = React.useState(false);
  const [isDoctorLoggedIn, setIsDoctorLoggedInState] = React.useState(false);
  const [theme, setThemeState] = React.useState<Theme>('system');
  const [biomarkerUnit, setBiomarkerUnitState] = React.useState<BiomarkerUnitSystem>('conventional');
  const [customBiomarkers, setCustomBiomarkersState] = React.useState<CustomBiomarker[]>([]);
  
  React.useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      setThemeState(storedTheme);
    }
    const countryUnit = countries.find(c => c.code === profile.country)?.biomarkerUnit || 'conventional';
    setBiomarkerUnitState(countryUnit);
    setIsClient(true);
  }, [profile.country]);

  React.useEffect(() => {
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

  const getDisplayLipidValue = (value: number, type: 'ldl' | 'hdl' | 'total' | 'triglycerides'): number => {
    if (biomarkerUnit === 'si') {
      return parseFloat(toMmolL(value, type).toFixed(2));
    }
    return Math.round(value);
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

  const getDbLipidValue = (value: number, type: 'ldl' | 'hdl' | 'total' | 'triglycerides'): number => {
    if (biomarkerUnit === 'si') {
        return toMgDl(value, type);
    }
    return value;
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
  
  const setIsDoctorLoggedIn = (isLoggedIn: boolean) => {
    setIsDoctorLoggedInState(isLoggedIn);
  }
  
  const setPatientData = React.useCallback((patient: Patient) => {
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
      enabledDashboards: Array.isArray(patient.enabledDashboards) ? patient.enabledDashboards : ['lipids', 'vitaminD', 'thyroid', 'hypertension', 'renal'],
      bmi: patient.bmi,
      doctorName: patient.doctorName,
      customBiomarkers: patient.customBiomarkers || [],
    };
    setProfileState(patientProfile);
    setHba1cRecordsState(patient.hba1cRecords || []);
    setFastingBloodGlucoseRecordsState(patient.fastingBloodGlucoseRecords || []);
    setLipidRecordsState(patient.lipidRecords || []);
    setVitaminDRecordsState(patient.vitaminDRecords || []);
    setThyroidRecordsState(patient.thyroidRecords || []);
    setRenalRecordsState(patient.renalRecords || []);
    setElectrolyteRecordsState(patient.electrolyteRecords || []);
    setMineralBoneDiseaseRecordsState(patient.mineralBoneDiseaseRecords || []);
    setHemoglobinRecordsState(patient.hemoglobinRecords || []);
    setNutritionRecordsState(patient.nutritionRecords || []);
    setWeightRecordsState(patient.weightRecords || []);
    setBloodPressureRecordsState(patient.bloodPressureRecords || []);
    setCustomBiomarkersState(patient.customBiomarkers || []);
    setTips([]); 
    setDashboardViewState('report');
    setBiomarkerUnitState(countries.find(c => c.code === patient.country)?.biomarkerUnit || 'conventional');
  }, []);
  
  const updatePatientData = async (patientId: string, updates: Partial<Patient>) => {
      if (!patientId) return;
      try {
          await updatePatient(patientId, updates);
      } catch (e) {
          console.error("Failed to update patient data in Firestore", e);
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
      setProfileState(newProfile);
      updatePatientData(newProfile.id, { ...newProfile });
  }
  
  const addMedicalCondition = (condition: Partial<Omit<MedicalCondition, 'id' | 'status'>> & {condition: string, date: string, icdCode?: string, requiredBiomarkers?: string[]}) => {
    const validDate = condition.date && isValid(parseISO(condition.date)) 
        ? condition.date 
        : new Date().toISOString();

    let newCondition: MedicalCondition = { 
        ...condition,
        date: validDate,
        id: Date.now().toString(), 
        status: isDoctorLoggedIn ? 'verified' : 'pending_review'
    };

    const updatedConditions = [...profile.presentMedicalConditions, newCondition];
    setProfileState(p => ({ ...p, presentMedicalConditions: updatedConditions }));
    updatePatientData(profile.id, { presentMedicalConditions: updatedConditions });
};

  const updateMedicalCondition = (condition: MedicalCondition) => {
    const updatedConditions = profile.presentMedicalConditions.map(c => c.id === condition.id ? condition : c);
    setProfileState(p => ({ ...p, presentMedicalConditions: updatedConditions }));
    updatePatientData(profile.id, { presentMedicalConditions: updatedConditions });
  };
  
  const removeMedicalCondition = (id: string) => {
    const updatedConditions = profile.presentMedicalConditions.filter(c => c.id !== id);
    setProfileState(p => ({ ...p, presentMedicalConditions: updatedConditions }));
    updatePatientData(profile.id, { presentMedicalConditions: updatedConditions });
  };
  
  const approveMedicalCondition = (conditionId: string) => {
    const updatedConditions = profile.presentMedicalConditions.map(c => 
      c.id === conditionId ? { ...c, status: 'verified' as const } : c
    );
    setProfileState(p => ({...p, presentMedicalConditions: updatedConditions }));
    updatePatientData(profile.id, { presentMedicalConditions: updatedConditions });
  };
  
  const dismissSuggestion = (conditionId: string) => {
    const updatedConditions = profile.presentMedicalConditions.map(c => 
      c.id === conditionId ? { ...c, status: 'needs_revision' as const } : c
    );
    
    setProfileState(p => ({...p, presentMedicalConditions: updatedConditions }));
    updatePatientData(profile.id, { presentMedicalConditions: updatedConditions });
  };

   const addMedication = (medication: Omit<Medication, 'id'>) => {
    const newMedication = { ...medication, id: Date.now().toString() };
    const updatedMedication = [...profile.medication.filter(m => m.name.toLowerCase() !== 'nil'), newMedication];
    setProfileState(p => ({ ...p, medication: updatedMedication }));
    updatePatientData(profile.id, { medication: updatedMedication });
  };

  const removeMedication = (id: string) => {
    const updatedMedication = profile.medication.filter(m => m.id !== id);
    setProfileState(p => ({ ...p, medication: updatedMedication }));
    updatePatientData(profile.id, { medication: updatedMedication });
  };

  const setMedicationNil = () => {
      const nilMedication = [{ id: 'nil', name: 'Nil', dosage: '', frequency: '' }];
      setProfileState(p => ({...p, medication: nilMedication}));
      updatePatientData(profile.id, { medication: nilMedication });
  }

  const addHba1cRecord = (record: Omit<Hba1cRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    const updatedRecords = [...hba1cRecords, newRecord];
    setHba1cRecordsState(updatedRecords);
    updatePatientData(profile.id, { hba1cRecords: updatedRecords });
  };

  const removeHba1cRecord = (id: string) => {
    const updatedRecords = hba1cRecords.filter(r => r.id !== id);
    setHba1cRecordsState(updatedRecords);
    updatePatientData(profile.id, { hba1cRecords: updatedRecords });
  };
  
  const addFastingBloodGlucoseRecord = (record: Omit<FastingBloodGlucoseRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    const updatedRecords = [...fastingBloodGlucoseRecords, newRecord];
    setFastingBloodGlucoseRecordsState(updatedRecords);
    updatePatientData(profile.id, { fastingBloodGlucoseRecords: updatedRecords });
  };

  const removeFastingBloodGlucoseRecord = (id: string) => {
    const updatedRecords = fastingBloodGlucoseRecords.filter(r => r.id !== id);
    setFastingBloodGlucoseRecordsState(updatedRecords);
    updatePatientData(profile.id, { fastingBloodGlucoseRecords: updatedRecords });
  };

  const addLipidRecord = (record: Omit<LipidRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    const updatedRecords = [...lipidRecords, newRecord];
    setLipidRecordsState(updatedRecords);
    updatePatientData(profile.id, { lipidRecords: updatedRecords });
  };

  const removeLipidRecord = (id: string) => {
    const updatedRecords = lipidRecords.filter(r => r.id !== id);
    setLipidRecordsState(updatedRecords);
    updatePatientData(profile.id, { lipidRecords: updatedRecords });
  };

  const addVitaminDRecord = (record: Omit<VitaminDRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    const updatedRecords = [...vitaminDRecords, newRecord];
    setVitaminDRecordsState(updatedRecords);
    updatePatientData(profile.id, { vitaminDRecords: updatedRecords });
  };

  const removeVitaminDRecord = (id: string) => {
    const updatedRecords = vitaminDRecords.filter(r => r.id !== id);
    setVitaminDRecordsState(updatedRecords);
    updatePatientData(profile.id, { vitaminDRecords: updatedRecords });
  };

  const addThyroidRecord = (record: Omit<ThyroidRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    const updatedRecords = [...thyroidRecords, newRecord];
    setThyroidRecordsState(updatedRecords);
    updatePatientData(profile.id, { thyroidRecords: updatedRecords });
  };

  const removeThyroidRecord = (id: string) => {
    const updatedRecords = thyroidRecords.filter(r => r.id !== id);
    setThyroidRecordsState(updatedRecords);
    updatePatientData(profile.id, { thyroidRecords: updatedRecords });
  };
  
  const addRenalRecord = (record: Omit<RenalRecord, 'id' | 'medication' | 'eGFR'>) => {
     const age = calculateAge(profile.dob);
     const eGFR = age ? calculateEgfr(record.serumCreatinine, record.serumCreatinineUnits, age, profile.gender) : undefined;
    const newRecord = { ...record, eGFR, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    const updatedRecords = [...renalRecords, newRecord];
    setRenalRecordsState(updatedRecords);
    updatePatientData(profile.id, { renalRecords: updatedRecords });
  };

  const removeRenalRecord = (id: string) => {
    const updatedRecords = renalRecords.filter(r => r.id !== id);
    setRenalRecordsState(updatedRecords);
    updatePatientData(profile.id, { renalRecords: updatedRecords });
  };
  
  const addElectrolyteRecord = (record: Omit<ElectrolyteRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    const updatedRecords = [...electrolyteRecords, newRecord];
    setElectrolyteRecordsState(updatedRecords);
    updatePatientData(profile.id, { electrolyteRecords: updatedRecords });
  };

  const removeElectrolyteRecord = (id: string) => {
    const updatedRecords = electrolyteRecords.filter(r => r.id !== id);
    setElectrolyteRecordsState(updatedRecords);
    updatePatientData(profile.id, { electrolyteRecords: updatedRecords });
  };
  
  const addMineralBoneDiseaseRecord = (record: Omit<MineralBoneDiseaseRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    const updatedRecords = [...mineralBoneDiseaseRecords, newRecord];
    setMineralBoneDiseaseRecordsState(updatedRecords);
    updatePatientData(profile.id, { mineralBoneDiseaseRecords: updatedRecords });
  };

  const removeMineralBoneDiseaseRecord = (id: string) => {
    const updatedRecords = mineralBoneDiseaseRecords.filter(r => r.id !== id);
    setMineralBoneDiseaseRecordsState(updatedRecords);
    updatePatientData(profile.id, { mineralBoneDiseaseRecords: updatedRecords });
  };

  const addHemoglobinRecord = (record: Omit<HemoglobinRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    const updatedRecords = [...hemoglobinRecords, newRecord];
    setHemoglobinRecordsState(updatedRecords);
    updatePatientData(profile.id, { hemoglobinRecords: updatedRecords });
  };

  const removeHemoglobinRecord = (id: string) => {
    const updatedRecords = hemoglobinRecords.filter(r => r.id !== id);
    setHemoglobinRecordsState(updatedRecords);
    updatePatientData(profile.id, { hemoglobinRecords: updatedRecords });
  };
  
  const addNutritionRecord = (record: Omit<NutritionRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    const updatedRecords = [...nutritionRecords, newRecord];
    setNutritionRecordsState(updatedRecords);
    updatePatientData(profile.id, { nutritionRecords: updatedRecords });
  };

  const removeNutritionRecord = (id: string) => {
    const updatedRecords = nutritionRecords.filter(r => r.id !== id);
    setNutritionRecordsState(updatedRecords);
    updatePatientData(profile.id, { nutritionRecords: updatedRecords });
  };

  const addWeightRecord = (record: Omit<WeightRecord, 'id'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    const updatedRecords = [...weightRecords, newRecord];
    setWeightRecordsState(updatedRecords);

    const newBmi = calculateBmi(newRecord.value, profile.height);
    const updatedProfile = { ...profile, bmi: newBmi || profile.bmi };
    setProfileState(updatedProfile);

    updatePatientData(profile.id, { weightRecords: updatedRecords, bmi: updatedProfile.bmi });
  };

  const removeWeightRecord = (id: string) => {
    const updatedRecords = weightRecords.filter(r => r.id !== id);
    setWeightRecordsState(updatedRecords);

    const lastWeight = [...updatedRecords].sort((a,b) => new Date(a.date as string).getTime() - new Date(a.date as string).getTime())[0];
    const newBmi = calculateBmi(lastWeight?.value, profile.height);
    const updatedProfile = { ...profile, bmi: newBmi };
    setProfileState(updatedProfile);

    updatePatientData(profile.id, { weightRecords: updatedRecords, bmi: updatedProfile.bmi });
  };
  
  const addBloodPressureRecord = (record: Omit<BloodPressureRecord, 'id' | 'medication'>) => {
    const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString(), medication: getMedicationForRecord(profile.medication) };
    const updatedRecords = [...bloodPressureRecords, newRecord];
    setBloodPressureRecordsState(updatedRecords);
    updatePatientData(profile.id, { bloodPressureRecords: updatedRecords });
  };

  const removeBloodPressureRecord = (id: string) => {
    const updatedRecords = bloodPressureRecords.filter(r => r.id !== id);
    setBloodPressureRecordsState(updatedRecords);
    updatePatientData(profile.id, { bloodPressureRecords: updatedRecords });
  };
  
  const addCustomBiomarker = async (name: string): Promise<void> => {
    const newBiomarker: CustomBiomarker = {
      id: `custom-${Date.now()}`,
      name,
    };
    const updatedBiomarkers = [...(profile.customBiomarkers || []), newBiomarker];
    setCustomBiomarkersState(updatedBiomarkers);
    await updatePatientData(profile.id, { customBiomarkers: updatedBiomarkers });
  };

  const removeCustomBiomarker = (id: string) => {
    const updatedBiomarkers = (profile.customBiomarkers || []).filter(b => b.id !== id);
    setCustomBiomarkersState(updatedBiomarkers);
    updatePatientData(profile.id, { customBiomarkers: updatedBiomarkers });
  };

  const getDashboardName = (key: string): string => {
      const names: Record<string, string> = {
        hba1c: 'HbA1c',
        lipids: 'Lipid',
        vitaminD: 'Vitamin D',
        thyroid: 'Thyroid',
        hypertension: 'Hypertension',
        renal: 'Renal'
      };
      return names[key] || 'Unknown';
  };
  
  const enableDashboard = (dashboardKey: string): EnableDashboardResult => {
    const currentDashboards = profile.enabledDashboards || [];
    if (currentDashboards.includes(dashboardKey)) {
        return { alreadyExists: true, name: getDashboardName(dashboardKey) };
    }
    const updatedDashboards = [...currentDashboards, dashboardKey];
    setProfileState(p => ({ ...p, enabledDashboards: updatedDashboards }));
    updatePatientData(profile.id, { enabledDashboards: updatedDashboards });
    return { alreadyExists: false, name: getDashboardName(dashboardKey) };
  };

  const addBatchRecords = async (batch: BatchRecords): Promise<AddBatchRecordsResult> => {
    const newMedication = getMedicationForRecord(profile.medication);
    const updates: Partial<Patient> = {};
    const date = batch.hba1c?.date || batch.fastingBloodGlucose?.date || batch.lipid?.date || batch.vitaminD?.date || batch.thyroid?.date || batch.bloodPressure?.date || batch.renal?.date;

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
      const dateExists = hba1cRecords.some(r => startOfDay(parseISO(r.date as string)).getTime() === newRecordDate.getTime());
      if (!dateExists) {
        const newRecord: Hba1cRecord = { ...batch.hba1c, id: `hba1c-${Date.now()}`, medication: newMedication, date: newRecordDate.toISOString() };
        updates.hba1cRecords = [...hba1cRecords, newRecord];
        setHba1cRecordsState(updates.hba1cRecords);
        result.added.push('HbA1c');
      } else { result.duplicates.push('HbA1c'); }
    }

    if (batch.fastingBloodGlucose && batch.fastingBloodGlucose.value) {
      const dateExists = fastingBloodGlucoseRecords.some(r => startOfDay(parseISO(r.date as string)).getTime() === newRecordDate.getTime());
      if (!dateExists) {
        const newRecord: FastingBloodGlucoseRecord = { ...batch.fastingBloodGlucose, id: `fbg-${Date.now()}`, medication: newMedication, date: newRecordDate.toISOString() };
        updates.fastingBloodGlucoseRecords = [...fastingBloodGlucoseRecords, newRecord];
        setFastingBloodGlucoseRecordsState(updates.fastingBloodGlucoseRecords);
        result.added.push('Fasting Blood Glucose');
      } else { result.duplicates.push('Fasting Blood Glucose'); }
    }

    if (batch.lipid && batch.lipid.ldl && batch.lipid.hdl && batch.lipid.triglycerides && batch.lipid.total) {
      const dateExists = lipidRecords.some(r => startOfDay(parseISO(r.date as string)).getTime() === newRecordDate.getTime());
      
      let lipidRecordForDb = { ...batch.lipid };
      if (batch.lipid.units && batch.lipid.units !== 'mg/dL') {
        lipidRecordForDb.ldl = toMgDl(batch.lipid.ldl, 'ldl');
        lipidRecordForDb.hdl = toMgDl(batch.lipid.hdl, 'hdl');
        lipidRecordForDb.triglycerides = toMgDl(batch.lipid.triglycerides, 'triglycerides');
        lipidRecordForDb.total = toMgDl(batch.lipid.total, 'total');
      }

      if (!dateExists) {
        const newRecord: LipidRecord = { ...lipidRecordForDb, id: `lipid-${Date.now()}`, medication: newMedication, date: newRecordDate.toISOString() };
        updates.lipidRecords = [...lipidRecords, newRecord];
        setLipidRecordsState(updates.lipidRecords);
        result.added.push('Lipid Panel');
      } else if (dateExists) { result.duplicates.push('Lipid Panel'); }
    }
    
    if (batch.vitaminD && batch.vitaminD.value) {
      const dateExists = vitaminDRecords.some(r => startOfDay(parseISO(r.date as string)).getTime() === newRecordDate.getTime());
      
      let vitDRecordForDb = { ...batch.vitaminD };
      if(batch.vitaminD.units && batch.vitaminD.units !== 'ng/mL') {
        vitDRecordForDb.value = toNgDl(batch.vitaminD.value);
      }

      if (!dateExists) {
        const newRecord: VitaminDRecord = { ...vitDRecordForDb, value: vitDRecordForDb.value, id: `vitd-${Date.now()}`, medication: newMedication, date: newRecordDate.toISOString() };
        updates.vitaminDRecords = [...vitaminDRecords, newRecord];
        setVitaminDRecordsState(updates.vitaminDRecords);
        result.added.push('Vitamin D');
      } else if(dateExists) { result.duplicates.push('Vitamin D'); }
    }
    
    if (batch.thyroid && batch.thyroid.tsh && batch.thyroid.t3 && batch.thyroid.t4) {
      const dateExists = thyroidRecords.some(r => startOfDay(parseISO(r.date as string)).getTime() === newRecordDate.getTime());
      if (!dateExists) {
        const newRecord: ThyroidRecord = { ...batch.thyroid, id: `thyroid-${Date.now()}`, medication: newMedication, date: newRecordDate.toISOString() };
        updates.thyroidRecords = [...thyroidRecords, newRecord];
        setThyroidRecordsState(updates.thyroidRecords);
        result.added.push('Thyroid Panel');
      } else { result.duplicates.push('Thyroid Panel'); }
    }
    
    if (batch.bloodPressure && batch.bloodPressure.systolic && batch.bloodPressure.diastolic) {
       const dateExists = bloodPressureRecords.some(r => startOfDay(parseISO(r.date as string)).getTime() === newRecordDate.getTime());
       if (!dateExists) {
        const newRecord: BloodPressureRecord = { ...batch.bloodPressure, id: `bp-${Date.now()}`, medication: newMedication, date: newRecordDate.toISOString() };
        updates.bloodPressureRecords = [...bloodPressureRecords, newRecord];
        setBloodPressureRecordsState(updates.bloodPressureRecords);
        result.added.push('Blood Pressure');
      } else { result.duplicates.push('Blood Pressure'); }
    }
    
    if (batch.renal && batch.renal.egfr && batch.renal.uacr) {
       const dateExists = renalRecords.some(r => startOfDay(parseISO(r.date as string)).getTime() === newRecordDate.getTime());
       if (!dateExists) {
        const newRecord: RenalRecord = { ...batch.renal, id: `renal-${Date.now()}`, medication: newMedication, date: newRecordDate.toISOString() };
        updates.renalRecords = [...renalRecords, newRecord];
        setRenalRecordsState(updates.renalRecords);
        result.added.push('Renal Panel');
      } else { result.duplicates.push('Renal Panel'); }
    }

    if (batch.hemoglobin) {
       const dateExists = hemoglobinRecords.some(r => startOfDay(parseISO(r.date as string)).getTime() === newRecordDate.getTime());
       if (!dateExists) {
        const newRecord: HemoglobinRecord = { hemoglobin: batch.hemoglobin, id: `anemia-${Date.now()}`, medication: newMedication, date: newRecordDate.toISOString() };
        updates.hemoglobinRecords = [...hemoglobinRecords, newRecord];
        setHemoglobinRecordsState(updates.hemoglobinRecords);
        result.added.push('Hemoglobin');
      } else { result.duplicates.push('Hemoglobin'); }
    }
    
    if (batch.albumin) {
        const dateExists = nutritionRecords.some(r => startOfDay(parseISO(r.date as string)).getTime() === newRecordDate.getTime());
        if (!dateExists) {
         const newRecord: NutritionRecord = { albumin: batch.albumin, id: `nutrition-${Date.now()}`, medication: newMedication, date: newRecordDate.toISOString() };
         updates.nutritionRecords = [...nutritionRecords, newRecord];
         setNutritionRecordsState(updates.nutritionRecords);
         result.added.push('Nutrition (Albumin)');
       } else { result.duplicates.push('Nutrition (Albumin)'); }
    }

    if (batch.electrolytes) {
        const dateExists = electrolyteRecords.some(r => startOfDay(parseISO(r.date as string)).getTime() === newRecordDate.getTime());
        if (!dateExists) {
            const newRecord: ElectrolyteRecord = { ...batch.electrolytes, id: `electrolytes-${Date.now()}`, date: newRecordDate.toISOString(), medication: newMedication };
            updates.electrolyteRecords = [...electrolyteRecords, newRecord];
            setElectrolyteRecordsState(updates.electrolyteRecords);
            result.added.push('Electrolytes');
        } else {
            result.duplicates.push('Electrolytes');
        }
    }
    
    if (batch.mineralBone) {
        const dateExists = mineralBoneDiseaseRecords.some(r => startOfDay(parseISO(r.date as string)).getTime() === newRecordDate.getTime());
        if (!dateExists) {
            const newRecord: MineralBoneDiseaseRecord = { ...batch.mineralBone, id: `mineralbone-${Date.now()}`, date: newRecordDate.toISOString(), medication: newMedication };
            updates.mineralBoneDiseaseRecords = [...mineralBoneDiseaseRecords, newRecord];
            setMineralBoneDiseaseRecordsState(updates.mineralBoneDiseaseRecords);
            result.added.push('Mineral/Bone');
        } else {
            result.duplicates.push('Mineral/Bone');
        }
    }
    
    if (Object.keys(updates).length > 0) {
        await updatePatientData(profile.id, updates);
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
    lipidRecords,
    addLipidRecord,
    removeLipidRecord,
    vitaminDRecords,
    addVitaminDRecord,
    removeVitaminDRecord,
    thyroidRecords,
    addThyroidRecord,
    removeThyroidRecord,
    renalRecords,
    addRenalRecord,
    removeRenalRecord,
    electrolyteRecords,
    addElectrolyteRecord,
    removeElectrolyteRecord,
    mineralBoneDiseaseRecords,
    addMineralBoneDiseaseRecord,
    removeMineralBoneDiseaseRecord,
    hemoglobinRecords,
    addHemoglobinRecord,
    removeHemoglobinRecord,
    nutritionRecords,
    addNutritionRecord,
    removeNutritionRecord,
    weightRecords,
    addWeightRecord,
    removeWeightRecord,
    bloodPressureRecords,
    addBloodPressureRecord,
    removeBloodPressureRecord,
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
    getDisplayLipidValue,
    getDisplayVitaminDValue,
    getDisplayGlucoseValue,
    getDisplayHemoglobinValue,
    getDbLipidValue,
    getDbVitaminDValue,
    getDbGlucoseValue,
    getDbHemoglobinValue,
    theme,
    setTheme: setThemeState,
    dashboardSuggestions: [],
    enableDashboard,
    customBiomarkers,
    addCustomBiomarker,
    removeCustomBiomarker,
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
