
'use client';

import { type Hba1cRecord, type UserProfile, type LipidRecord, type MedicalCondition, type Patient, type Medication } from '@/lib/types';
import * as React from 'react';

const initialProfile: UserProfile = { id: '', name: 'User', dob: '', gender: 'other', presentMedicalConditions: [], medication: [] };
const DOCTOR_NAME = 'Dr. Badhrinathan N';


type DashboardView = 'hba1c' | 'lipids';

interface AppContextType {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  addMedicalCondition: (condition: Omit<MedicalCondition, 'id'>) => void;
  removeMedicalCondition: (id: string) => void;
  records: Hba1cRecord[];
  addRecord: (record: Omit<Hba1cRecord, 'id' | 'medication'>) => void;
  removeRecord: (id: string) => void;
  lipidRecords: LipidRecord[];
  addLipidRecord: (record: Omit<LipidRecord, 'id' | 'medication'>) => void;
  removeLipidRecord: (id: string) => void;
  tips: string[];
  setTips: (tips: string[]) => void;
  isClient: boolean;
  dashboardView: DashboardView;
  setDashboardView: (view: DashboardView) => void;
  isDoctorLoggedIn: boolean;
  doctorName: string;
  setPatientData: (patient: Patient) => void;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = React.useState<UserProfile>(initialProfile);
  const [records, setRecordsState] = React.useState<Hba1cRecord[]>([]);
  const [lipidRecords, setLipidRecordsState] = React.useState<LipidRecord[]>([]);
  const [tips, setTipsState] = React.useState<string[]>([]);
  const [dashboardView, setDashboardViewState] = React.useState<DashboardView>('hba1c');
  const [isClient, setIsClient] = React.useState(false);
  const [isDoctorLoggedIn, setIsDoctorLoggedIn] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    // This check is for general patient view vs doctor portal view
    setIsDoctorLoggedIn(!!localStorage.getItem('doctor_logged_in'));
  }, []);
  
  const setPatientData = React.useCallback((patient: Patient) => {
    const patientProfile: UserProfile = {
      id: patient.id,
      name: patient.name,
      dob: patient.dob,
      gender: patient.gender,
      medication: Array.isArray(patient.medication) ? patient.medication : [],
      presentMedicalConditions: Array.isArray(patient.presentMedicalConditions) ? patient.presentMedicalConditions : []
    };
    setProfileState(patientProfile);
    setRecordsState(patient.records || []);
    setLipidRecordsState(patient.lipidRecords || []);
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

  const getUpdatedPatientObject = React.useCallback((currentProfile: UserProfile, currentRecords: Hba1cRecord[], currentLipidRecords: LipidRecord[], updates: Partial<Patient>): Patient => {
    const currentPatient: Patient = {
      id: currentProfile.id,
      name: currentProfile.name,
      dob: currentProfile.dob,
      gender: currentProfile.gender,
      email: '', // Not available in profile, needs to be handled
      phone: '', // Not available in profile, needs to be handled
      records: currentRecords,
      lipidRecords: currentLipidRecords,
      medication: Array.isArray(currentProfile.medication) ? currentProfile.medication : [],
      presentMedicalConditions: currentProfile.presentMedicalConditions,
      lastHba1c: null, // these will be recalculated
      lastLipid: null,
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

    // Recalculate Status
    let status: Patient['status'] = 'On Track';
    if (currentPatient.lastHba1c) {
      if (currentPatient.lastHba1c.value >= 7.0) status = 'Urgent';
      else if (currentPatient.lastHba1c.value >= 5.7) status = 'Needs Review';
    }
    if (currentPatient.lastLipid) {
       if (currentPatient.lastLipid.ldl >= 130 && status !== 'Urgent') status = 'Needs Review';
    }
    currentPatient.status = status;

    return currentPatient;
  }, []);
  
  const setProfile = React.useCallback((newProfile: UserProfile) => {
    setProfileState(newProfile);
    const updatedPatient = getUpdatedPatientObject(newProfile, records, lipidRecords, {});
    syncPatientDataToLocalStorage(updatedPatient);
  }, [getUpdatedPatientObject, records, lipidRecords, syncPatientDataToLocalStorage]);
  
  const addMedicalCondition = React.useCallback((condition: Omit<MedicalCondition, 'id'>) => {
    const newCondition = { ...condition, id: Date.now().toString() };
    setProfileState(prevProfile => {
        const updatedConditions = [...prevProfile.presentMedicalConditions, newCondition];
        updatedConditions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const newProfile = { ...prevProfile, presentMedicalConditions: updatedConditions };
        const updatedPatient = getUpdatedPatientObject(newProfile, records, lipidRecords, {});
        syncPatientDataToLocalStorage(updatedPatient);
        return newProfile;
    });
  }, [getUpdatedPatientObject, records, lipidRecords, syncPatientDataToLocalStorage]);
  
  const removeMedicalCondition = React.useCallback((id: string) => {
    setProfileState(prevProfile => {
        const updatedConditions = prevProfile.presentMedicalConditions.filter(c => c.id !== id);
        const newProfile = { ...prevProfile, presentMedicalConditions: updatedConditions };
        const updatedPatient = getUpdatedPatientObject(newProfile, records, lipidRecords, {});
        syncPatientDataToLocalStorage(updatedPatient);
        return newProfile;
    });
  }, [getUpdatedPatientObject, records, lipidRecords, syncPatientDataToLocalStorage]);

  const setTips = (newTips: string[]) => {
    setTipsState(newTips);
  };

  const setDashboardView = (view: DashboardView) => {
    setDashboardViewState(view);
  }
  
  const getMedicationString = (medication: Medication[]): string => {
    if (!medication || !Array.isArray(medication) || medication.length === 0) return 'N/A';
    const medStrings = medication.map(m => `${m.name} ${m.dosage} ${m.frequency}`);
    return medStrings.join(', ');
  }

  const addRecord = React.useCallback((record: Omit<Hba1cRecord, 'id' | 'medication'>) => {
    setRecordsState(prevRecords => {
      const newRecord = { 
        ...record, 
        id: Date.now().toString(), 
        date: new Date(record.date).toISOString(), 
        medication: getMedicationString(profile.medication)
      };
      const newRecords = [...prevRecords, newRecord];
      const updatedPatient = getUpdatedPatientObject(profile, newRecords, lipidRecords, {});
      syncPatientDataToLocalStorage(updatedPatient);
      return newRecords;
    });
  }, [profile, lipidRecords, getUpdatedPatientObject, syncPatientDataToLocalStorage]);

  const removeRecord = React.useCallback((id: string) => {
    setRecordsState(prevRecords => {
      const newRecords = prevRecords.filter((r) => r.id !== id);
      const updatedPatient = getUpdatedPatientObject(profile, newRecords, lipidRecords, {});
      syncPatientDataToLocalStorage(updatedPatient);
      return newRecords;
    });
  }, [profile, lipidRecords, getUpdatedPatientObject, syncPatientDataToLocalStorage]);

  const addLipidRecord = React.useCallback((record: Omit<LipidRecord, 'id' | 'medication'>) => {
    setLipidRecordsState(prevRecords => {
      const newRecord = {
        ...record,
        id: Date.now().toString(),
        date: new Date(record.date).toISOString(),
        medication: getMedicationString(profile.medication),
      };
      const newRecords = [...prevRecords, newRecord];
      const updatedPatient = getUpdatedPatientObject(profile, records, newRecords, {});
      syncPatientDataToLocalStorage(updatedPatient);
      return newRecords;
    });
  }, [profile, records, getUpdatedPatientObject, syncPatientDataToLocalStorage]);

  const removeLipidRecord = React.useCallback((id: string) => {
    setLipidRecordsState(prevRecords => {
      const newRecords = prevRecords.filter((r) => r.id !== id);
      const updatedPatient = getUpdatedPatientObject(profile, records, newRecords, {});
      syncPatientDataToLocalStorage(updatedPatient);
      return newRecords;
    });
  }, [profile, records, getUpdatedPatientObject, syncPatientDataToLocalStorage]);
  
  const value: AppContextType = {
    profile,
    setProfile,
    addMedicalCondition,
    removeMedicalCondition,
    records,
    addRecord,
    removeRecord,
    lipidRecords,
    addLipidRecord,
    removeLipidRecord,
    tips,
    setTips,
    isClient,
    dashboardView,
    setDashboardView,
    isDoctorLoggedIn,
    doctorName: DOCTOR_NAME,
    setPatientData,
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
