
'use client';

import { type Hba1cRecord, type UserProfile, type LipidRecord, type MedicalCondition, type Patient } from '@/lib/types';
import * as React from 'react';

const initialProfile: UserProfile = { id: '', name: 'User', dob: '', gender: 'other', presentMedicalConditions: [], medication: '' };
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
      medication: patient.medication || '',
      presentMedicalConditions: patient.presentMedicalConditions || []
    };
    setProfileState(patientProfile);
    setRecordsState(patient.records || []);
    setLipidRecordsState(patient.lipidRecords || []);
    setTips([]); // Clear tips for new patient
  }, []);

  const syncPatientDataToLocalStorage = (updatedPatient: Patient) => {
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
  }

  const getUpdatedPatientObject = (updates: Partial<Patient>): Patient => {
    const currentPatient: Patient = {
      id: profile.id,
      name: profile.name,
      dob: profile.dob,
      gender: profile.gender,
      email: '', // Not available in profile, needs to be handled
      phone: '', // Not available in profile, needs to be handled
      records: records,
      lipidRecords: lipidRecords,
      medication: profile.medication,
      presentMedicalConditions: profile.presentMedicalConditions,
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
  }
  
  const setProfile = (newProfile: UserProfile) => {
    setProfileState(newProfile);
    const updatedPatient = getUpdatedPatientObject({ 
      medication: newProfile.medication 
    });
    syncPatientDataToLocalStorage(updatedPatient);
  };
  
  const addMedicalCondition = (condition: Omit<MedicalCondition, 'id'>) => {
    const newCondition = { ...condition, id: Date.now().toString() };
    const updatedConditions = [...profile.presentMedicalConditions, newCondition];
    updatedConditions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const newProfile = { ...profile, presentMedicalConditions: updatedConditions };
    setProfileState(newProfile);
    const updatedPatient = getUpdatedPatientObject({ presentMedicalConditions: updatedConditions });
    syncPatientDataToLocalStorage(updatedPatient);
  };
  
  const removeMedicalCondition = (id: string) => {
    const updatedConditions = profile.presentMedicalConditions.filter(c => c.id !== id);
    const newProfile = { ...profile, presentMedicalConditions: updatedConditions };
    setProfileState(newProfile);
    const updatedPatient = getUpdatedPatientObject({ presentMedicalConditions: updatedConditions });
    syncPatientDataToLocalStorage(updatedPatient);
  };

  const setTips = (newTips: string[]) => {
    setTipsState(newTips);
  };

  const setDashboardView = (view: DashboardView) => {
    setDashboardViewState(view);
  }

  const addRecord = (record: Omit<Hba1cRecord, 'id' | 'medication'>) => {
    const newRecord = { 
      ...record, 
      id: Date.now().toString(), 
      date: new Date(record.date).toISOString(), 
      medication: profile.medication || 'N/A' 
    };
    const newRecords = [...records, newRecord];
    setRecordsState(newRecords);
    const updatedPatient = getUpdatedPatientObject({ records: newRecords });
    syncPatientDataToLocalStorage(updatedPatient);
  };

  const removeRecord = (id: string) => {
    const newRecords = records.filter((r) => r.id !== id);
    setRecordsState(newRecords);
    const updatedPatient = getUpdatedPatientObject({ records: newRecords });
    syncPatientDataToLocalStorage(updatedPatient);
  };

  const addLipidRecord = (record: Omit<LipidRecord, 'id' | 'medication'>) => {
    const newRecord = {
      ...record,
      id: Date.now().toString(),
      date: new Date(record.date).toISOString(),
      medication: profile.medication || 'N/A',
    };
    const newRecords = [...lipidRecords, newRecord];
    setLipidRecordsState(newRecords);
    const updatedPatient = getUpdatedPatientObject({ lipidRecords: newRecords });
    syncPatientDataToLocalStorage(updatedPatient);
  };

  const removeLipidRecord = (id: string) => {
    const newRecords = lipidRecords.filter((r) => r.id !== id);
    setLipidRecordsState(newRecords);
    const updatedPatient = getUpdatedPatientObject({ lipidRecords: newRecords });
    syncPatientDataToLocalStorage(updatedPatient);
  };
  
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
