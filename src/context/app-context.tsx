

'use client';

import { type Hba1cRecord, type UserProfile, type LipidRecord, type MedicalCondition, type Patient, type Medication, type Theme, type VitaminDRecord, type ThyroidRecord, type WeightRecord } from '@/lib/types';
import * as React from 'react';
import { calculateBmi } from '@/lib/utils';

const initialProfile: UserProfile = { id: '', name: 'User', dob: '', gender: 'other', country: 'US', presentMedicalConditions: [], medication: [] };
const DOCTOR_NAME = 'Dr. Badhrinathan N';


type DashboardView = 'hba1c' | 'lipids' | 'vitaminD' | 'thyroid' | 'report';

interface BatchRecords {
    hba1c?: Omit<Hba1cRecord, 'id' | 'medication'>;
    lipid?: Omit<LipidRecord, 'id' | 'medication'>;
    vitaminD?: Omit<VitaminDRecord, 'id' | 'medication'>;
    thyroid?: Omit<ThyroidRecord, 'id' | 'medication'>;
}

interface AppContextType {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  addMedicalCondition: (condition: Omit<MedicalCondition, 'id'>) => void;
  removeMedicalCondition: (id: string) => void;
  addMedication: (medication: Omit<Medication, 'id'>) => void;
  removeMedication: (id: string) => void;
  records: Hba1cRecord[];
  addRecord: (record: Omit<Hba1cRecord, 'id' | 'medication'>) => void;
  removeRecord: (id: string) => void;
  lipidRecords: LipidRecord[];
  addLipidRecord: (record: Omit<LipidRecord, 'id' | 'medication'>) => void;
  removeLipidRecord: (id: string) => void;
  vitaminDRecords: VitaminDRecord[];
  addVitaminDRecord: (record: Omit<VitaminDRecord, 'id' | 'medication'>) => void;
  removeVitaminDRecord: (id: string) => void;
  thyroidRecords: ThyroidRecord[];
  addThyroidRecord: (record: Omit<ThyroidRecord, 'id' | 'medication'>) => void;
  removeThyroidRecord: (id: string) => void;
  weightRecords: WeightRecord[];
  addWeightRecord: (record: Omit<WeightRecord, 'id' | 'medication'>) => void;
  removeWeightRecord: (id: string) => void;
  addBatchRecords: (records: BatchRecords) => void;
  tips: string[];
  setTips: (tips: string[]) => void;
  isClient: boolean;
  dashboardView: DashboardView;
  setDashboardView: (view: DashboardView) => void;
  isDoctorLoggedIn: boolean;
  doctorName: string;
  setPatientData: (patient: Patient) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = React.useState<UserProfile>(initialProfile);
  const [records, setRecordsState] = React.useState<Hba1cRecord[]>([]);
  const [lipidRecords, setLipidRecordsState] = React.useState<LipidRecord[]>([]);
  const [vitaminDRecords, setVitaminDRecordsState] = React.useState<VitaminDRecord[]>([]);
  const [thyroidRecords, setThyroidRecordsState] = React.useState<ThyroidRecord[]>([]);
  const [weightRecords, setWeightRecordsState] = React.useState<WeightRecord[]>([]);
  const [tips, setTipsState] = React.useState<string[]>([]);
  const [dashboardView, setDashboardViewState] = React.useState<DashboardView>('hba1c');
  const [isClient, setIsClient] = React.useState(false);
  const [isDoctorLoggedIn, setIsDoctorLoggedIn] = React.useState(false);
  const [theme, setThemeState] = React.useState<Theme>('system');


  React.useEffect(() => {
    setIsClient(true);
    // This check is for general patient view vs doctor portal view
    setIsDoctorLoggedIn(!!localStorage.getItem('doctor_logged_in'));
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      setThemeState(storedTheme);
    }
  }, []);

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
      return;
    }
    root.classList.add(theme);
  }, [theme]);
  
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
      medication: Array.isArray(patient.medication) ? patient.medication : [],
      presentMedicalConditions: Array.isArray(patient.presentMedicalConditions) ? patient.presentMedicalConditions : [],
    };
    setProfileState(patientProfile);
    setRecordsState(patient.records || []);
    setLipidRecordsState(patient.lipidRecords || []);
    setVitaminDRecordsState(patient.vitaminDRecords || []);
    setThyroidRecordsState(patient.thyroidRecords || []);
    setWeightRecordsState(patient.weightRecords || []);
    setTips([]); // Clear tips for new patient
  }, []);

  const syncPatientDataToLocalStorage = React.useCallback((updatedPatient: Patient) => {
    try {
        const storedPatients = localStorage.getItem('doctor-patients');
        if (storedPatients) {
            const patients: Patient[] = JSON.parse(storedPatients);
            const patientIndex = patients.findIndex(p => p.id === updatedPatient.id);
            if (patientIndex > -1) {
                patients[patientIndex] = updatedPatient;
                localStorage.setItem('doctor-patients', JSON.stringify(patients));
            }
        }
    } catch (error) {
        console.error('Failed to sync patient data to localStorage', error);
    }
  }, []);

  const getUpdatedPatientObject = React.useCallback((currentProfile: UserProfile, currentRecords: Hba1cRecord[], currentLipidRecords: LipidRecord[], currentVitaminDRecords: VitaminDRecord[], currentThyroidRecords: ThyroidRecord[], currentWeightRecords: WeightRecord[], updates: Partial<Patient>): Patient => {
    const currentPatient: Patient = {
      id: currentProfile.id,
      name: currentProfile.name,
      dob: currentProfile.dob,
      gender: currentProfile.gender,
      email: currentProfile.email || '',
      country: currentProfile.country,
      phone: currentProfile.phone || '',
      height: currentProfile.height,
      records: currentRecords,
      lipidRecords: currentLipidRecords,
      vitaminDRecords: currentVitaminDRecords,
      thyroidRecords: currentThyroidRecords,
      weightRecords: currentWeightRecords,
      medication: Array.isArray(currentProfile.medication) ? currentProfile.medication : [],
      presentMedicalConditions: currentProfile.presentMedicalConditions,
      lastHba1c: null, // these will be recalculated
      lastLipid: null,
      lastVitaminD: null,
      lastThyroid: null,
      status: 'On Track', // this will be recalculated
      ...updates
    }
    
    // Recalculate latest records and status
    const sortedHba1c = [...(currentPatient.records || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (sortedHba1c.length > 0) {
      currentPatient.lastHba1c = { value: sortedHba1c[0].value, date: new Date(sortedHba1c[0].date).toISOString() };
    }
    
    const sortedLipids = [...(currentPatient.lipidRecords || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (sortedLipids.length > 0) {
      currentPatient.lastLipid = { ldl: sortedLipids[0].ldl, date: new Date(sortedLipids[0].date).toISOString() };
    }

    const sortedVitaminD = [...(currentPatient.vitaminDRecords || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (sortedVitaminD.length > 0) {
        currentPatient.lastVitaminD = { value: sortedVitaminD[0].value, date: new Date(sortedVitaminD[0].date).toISOString() };
    }

    const sortedThyroid = [...(currentPatient.thyroidRecords || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (sortedThyroid.length > 0) {
        currentPatient.lastThyroid = { tsh: sortedThyroid[0].tsh, date: new Date(sortedThyroid[0].date).toISOString() };
    }

    const sortedWeight = [...(currentPatient.weightRecords || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (currentPatient.height && sortedWeight.length > 0) {
        currentPatient.bmi = calculateBmi(sortedWeight[0].value, currentPatient.height);
    }

    // Recalculate Status
    let status: Patient['status'] = 'On Track';
    if (currentPatient.lastHba1c) {
      if (currentPatient.lastHba1c.value >= 7.0) status = 'Urgent';
      else if (currentPatient.lastHba1c.value >= 5.7) status = 'Needs Review';
    }
    if (currentPatient.lastLipid) {
       if (currentPatient.lastLipid.ldl >= 130 && status !== 'Urgent') status = 'Needs Review';
    }
    if (currentPatient.lastThyroid) {
       if ((currentPatient.lastThyroid.tsh < 0.4 || currentPatient.lastThyroid.tsh > 4.0) && status !== 'Urgent') status = 'Needs Review';
    }
    currentPatient.status = status;

    return currentPatient;
  }, []);
  
  const setProfile = React.useCallback((newProfile: UserProfile) => {
    setProfileState(newProfile);
    const updatedPatient = getUpdatedPatientObject(newProfile, records, lipidRecords, vitaminDRecords, thyroidRecords, weightRecords, {});
    syncPatientDataToLocalStorage(updatedPatient);
  }, [getUpdatedPatientObject, records, lipidRecords, vitaminDRecords, thyroidRecords, weightRecords, syncPatientDataToLocalStorage]);
  
  const addMedicalCondition = React.useCallback((condition: Omit<MedicalCondition, 'id'>) => {
    setProfileState(prevProfile => {
        const newCondition = { ...condition, id: Date.now().toString() };
        const updatedConditions = [...prevProfile.presentMedicalConditions, newCondition];
        updatedConditions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const newProfile = { ...prevProfile, presentMedicalConditions: updatedConditions };
        const updatedPatient = getUpdatedPatientObject(newProfile, records, lipidRecords, vitaminDRecords, thyroidRecords, weightRecords, {});
        syncPatientDataToLocalStorage(updatedPatient);
        return newProfile;
    });
  }, [getUpdatedPatientObject, records, lipidRecords, vitaminDRecords, thyroidRecords, weightRecords, syncPatientDataToLocalStorage]);
  
  const removeMedicalCondition = React.useCallback((id: string) => {
    setProfileState(prevProfile => {
        const updatedConditions = prevProfile.presentMedicalConditions.filter(c => c.id !== id);
        const newProfile = { ...prevProfile, presentMedicalConditions: updatedConditions };
        const updatedPatient = getUpdatedPatientObject(newProfile, records, lipidRecords, vitaminDRecords, thyroidRecords, weightRecords, {});
        syncPatientDataToLocalStorage(updatedPatient);
        return newProfile;
    });
  }, [getUpdatedPatientObject, records, lipidRecords, vitaminDRecords, thyroidRecords, weightRecords, syncPatientDataToLocalStorage]);

   const addMedication = React.useCallback((medication: Omit<Medication, 'id'>) => {
    setProfileState(prevProfile => {
      const newMedication = { ...medication, id: Date.now().toString() };
      const updatedMedications = [...prevProfile.medication, newMedication];
      const newProfile = { ...prevProfile, medication: updatedMedications };
      const updatedPatient = getUpdatedPatientObject(newProfile, records, lipidRecords, vitaminDRecords, thyroidRecords, weightRecords, {});
      syncPatientDataToLocalStorage(updatedPatient);
      return newProfile;
    });
  }, [getUpdatedPatientObject, records, lipidRecords, vitaminDRecords, thyroidRecords, weightRecords, syncPatientDataToLocalStorage]);

  const removeMedication = React.useCallback((id: string) => {
    setProfileState(prevProfile => {
      const updatedMedications = prevProfile.medication.filter(m => m.id !== id);
      const newProfile = { ...prevProfile, medication: updatedMedications };
      const updatedPatient = getUpdatedPatientObject(newProfile, records, lipidRecords, vitaminDRecords, thyroidRecords, weightRecords, {});
      syncPatientDataToLocalStorage(updatedPatient);
      return newProfile;
    });
  }, [getUpdatedPatientObject, records, lipidRecords, vitaminDRecords, thyroidRecords, weightRecords, syncPatientDataToLocalStorage]);


  const setTips = (newTips: string[]) => {
    setTipsState(newTips);
  };

  const setDashboardView = (view: DashboardView) => {
    setDashboardViewState(view);
  }

  const setTheme = (theme: Theme) => {
    localStorage.setItem('theme', theme);
    setThemeState(theme);
  }
  
  const getMedicationForRecord = (medication: Medication[]): string => {
    if (!medication || !Array.isArray(medication) || medication.length === 0) return 'N/A';
    try {
      return JSON.stringify(medication.map(m => ({name: m.name, dosage: m.dosage, frequency: m.frequency})));
    } catch {
      return 'N/A';
    }
  }

  const addRecord = React.useCallback((record: Omit<Hba1cRecord, 'id' | 'medication'>) => {
    setRecordsState(prevRecords => {
      const newRecord = { 
        ...record, 
        id: Date.now().toString(), 
        date: new Date(record.date).toISOString(), 
        medication: getMedicationForRecord(profile.medication)
      };
      const newRecords = [...prevRecords, newRecord];
      const updatedPatient = getUpdatedPatientObject(profile, newRecords, lipidRecords, vitaminDRecords, thyroidRecords, weightRecords, {});
      syncPatientDataToLocalStorage(updatedPatient);
      return newRecords;
    });
  }, [profile, lipidRecords, vitaminDRecords, thyroidRecords, weightRecords, getUpdatedPatientObject, syncPatientDataToLocalStorage]);

  const removeRecord = React.useCallback((id: string) => {
    setRecordsState(prevRecords => {
      const newRecords = prevRecords.filter((r) => r.id !== id);
      const updatedPatient = getUpdatedPatientObject(profile, newRecords, lipidRecords, vitaminDRecords, thyroidRecords, weightRecords, {});
      syncPatientDataToLocalStorage(updatedPatient);
      return newRecords;
    });
  }, [profile, lipidRecords, vitaminDRecords, thyroidRecords, weightRecords, getUpdatedPatientObject, syncPatientDataToLocalStorage]);

  const addLipidRecord = React.useCallback((record: Omit<LipidRecord, 'id' | 'medication'>) => {
    setLipidRecordsState(prevRecords => {
      const newRecord = {
        ...record,
        id: Date.now().toString(),
        date: new Date(record.date).toISOString(),
        medication: getMedicationForRecord(profile.medication),
      };
      const newRecords = [...prevRecords, newRecord];
      const updatedPatient = getUpdatedPatientObject(profile, records, newRecords, vitaminDRecords, thyroidRecords, weightRecords, {});
      syncPatientDataToLocalStorage(updatedPatient);
      return newRecords;
    });
  }, [profile, records, vitaminDRecords, thyroidRecords, weightRecords, getUpdatedPatientObject, syncPatientDataToLocalStorage]);

  const removeLipidRecord = React.useCallback((id: string) => {
    setLipidRecordsState(prevRecords => {
      const newRecords = prevRecords.filter((r) => r.id !== id);
      const updatedPatient = getUpdatedPatientObject(profile, records, newRecords, vitaminDRecords, thyroidRecords, weightRecords, {});
      syncPatientDataToLocalStorage(updatedPatient);
      return newRecords;
    });
  }, [profile, records, vitaminDRecords, thyroidRecords, weightRecords, getUpdatedPatientObject, syncPatientDataToLocalStorage]);

  const addVitaminDRecord = React.useCallback((record: Omit<VitaminDRecord, 'id' | 'medication'>) => {
    setVitaminDRecordsState(prevRecords => {
      const newRecord = {
        ...record,
        id: Date.now().toString(),
        date: new Date(record.date).toISOString(),
        medication: getMedicationForRecord(profile.medication),
      };
      const newRecords = [...prevRecords, newRecord];
      const updatedPatient = getUpdatedPatientObject(profile, records, lipidRecords, newRecords, thyroidRecords, weightRecords, {});
      syncPatientDataToLocalStorage(updatedPatient);
      return newRecords;
    });
  }, [profile, records, lipidRecords, thyroidRecords, weightRecords, getUpdatedPatientObject, syncPatientDataToLocalStorage]);

  const removeVitaminDRecord = React.useCallback((id: string) => {
    setVitaminDRecordsState(prevRecords => {
      const newRecords = prevRecords.filter((r) => r.id !== id);
      const updatedPatient = getUpdatedPatientObject(profile, records, lipidRecords, newRecords, thyroidRecords, weightRecords, {});
      syncPatientDataToLocalStorage(updatedPatient);
      return newRecords;
    });
  }, [profile, records, lipidRecords, thyroidRecords, weightRecords, getUpdatedPatientObject, syncPatientDataToLocalStorage]);

  const addThyroidRecord = React.useCallback((record: Omit<ThyroidRecord, 'id' | 'medication'>) => {
    setThyroidRecordsState(prevRecords => {
      const newRecord = {
        ...record,
        id: Date.now().toString(),
        date: new Date(record.date).toISOString(),
        medication: getMedicationForRecord(profile.medication),
      };
      const newRecords = [...prevRecords, newRecord];
      const updatedPatient = getUpdatedPatientObject(profile, records, lipidRecords, vitaminDRecords, newRecords, weightRecords, {});
      syncPatientDataToLocalStorage(updatedPatient);
      return newRecords;
    });
  }, [profile, records, lipidRecords, vitaminDRecords, weightRecords, getUpdatedPatientObject, syncPatientDataToLocalStorage]);

  const removeThyroidRecord = React.useCallback((id: string) => {
    setThyroidRecordsState(prevRecords => {
      const newRecords = prevRecords.filter((r) => r.id !== id);
      const updatedPatient = getUpdatedPatientObject(profile, records, lipidRecords, vitaminDRecords, newRecords, weightRecords, {});
      syncPatientDataToLocalStorage(updatedPatient);
      return newRecords;
    });
  }, [profile, records, lipidRecords, vitaminDRecords, weightRecords, getUpdatedPatientObject, syncPatientDataToLocalStorage]);
  
  const addWeightRecord = React.useCallback((record: Omit<WeightRecord, 'id' | 'medication'>) => {
    setWeightRecordsState(prevRecords => {
        const newRecord = {
            ...record,
            id: Date.now().toString(),
            date: new Date(record.date).toISOString(),
            medication: getMedicationForRecord(profile.medication),
        };
        const newRecords = [newRecord, ...prevRecords];
        newRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const updatedPatient = getUpdatedPatientObject(profile, records, lipidRecords, vitaminDRecords, thyroidRecords, newRecords, {});
        syncPatientDataToLocalStorage(updatedPatient);
        return newRecords;
    });
  }, [profile, records, lipidRecords, vitaminDRecords, thyroidRecords, getUpdatedPatientObject, syncPatientDataToLocalStorage]);

  const removeWeightRecord = React.useCallback((id: string) => {
    setWeightRecordsState(prevRecords => {
      const newRecords = prevRecords.filter((r) => r.id !== id);
      const updatedPatient = getUpdatedPatientObject(profile, records, lipidRecords, vitaminDRecords, thyroidRecords, newRecords, {});
      syncPatientDataToLocalStorage(updatedPatient);
      return newRecords;
    });
  }, [profile, records, lipidRecords, vitaminDRecords, thyroidRecords, getUpdatedPatientObject, syncPatientDataToLocalStorage]);

  const addBatchRecords = React.useCallback((batch: BatchRecords) => {
    const newMedication = getMedicationForRecord(profile.medication);
    let newHba1cRecords = [...records];
    let newLipidRecords = [...lipidRecords];
    let newVitaminDRecords = [...vitaminDRecords];
    let newThyroidRecords = [...thyroidRecords];

    if (batch.hba1c) {
        const newRecord: Hba1cRecord = {
            ...batch.hba1c,
            id: `hba1c-${Date.now()}`,
            medication: newMedication
        };
        newHba1cRecords.push(newRecord);
        setRecordsState(newHba1cRecords);
    }
    if (batch.lipid) {
        const newRecord: LipidRecord = {
            ldl: 0, 
            hdl: 0, 
            triglycerides: 0, 
            total: 0,
            ...batch.lipid,
            id: `lipid-${Date.now()}`,
            medication: newMedication
        };
        newLipidRecords.push(newRecord);
        setLipidRecordsState(newLipidRecords);
    }
    if (batch.vitaminD) {
        const newRecord: VitaminDRecord = {
            ...batch.vitaminD,
            id: `vitd-${Date.now()}`,
            medication: newMedication
        };
        newVitaminDRecords.push(newRecord);
        setVitaminDRecordsState(newVitaminDRecords);
    }

    if (batch.thyroid) {
        const newRecord: ThyroidRecord = {
            tsh: 0,
            t3: 0,
            t4: 0,
            ...batch.thyroid,
            id: `thyroid-${Date.now()}`,
            medication: newMedication
        };
        newThyroidRecords.push(newRecord);
        setThyroidRecordsState(newThyroidRecords);
    }

    const updatedPatient = getUpdatedPatientObject(profile, newHba1cRecords, newLipidRecords, newVitaminDRecords, newThyroidRecords, weightRecords, {});
    syncPatientDataToLocalStorage(updatedPatient);

  }, [profile, records, lipidRecords, vitaminDRecords, thyroidRecords, weightRecords, getUpdatedPatientObject, syncPatientDataToLocalStorage]);

  
  const value: AppContextType = {
    profile,
    setProfile,
    addMedicalCondition,
    removeMedicalCondition,
    addMedication,
    removeMedication,
    records,
    addRecord,
    removeRecord,
    lipidRecords,
    addLipidRecord,
    removeLipidRecord,
    vitaminDRecords,
    addVitaminDRecord,
    removeVitaminDRecord,
    thyroidRecords,
    addThyroidRecord,
    removeThyroidRecord,
    weightRecords,
    addWeightRecord,
    removeWeightRecord,
    addBatchRecords,
    tips,
    setTips,
    isClient,
    dashboardView,
    setDashboardView,
    isDoctorLoggedIn,
    doctorName: DOCTOR_NAME,
    setPatientData,
    theme,
    setTheme,
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
