
'use client';

import { type Hba1cRecord, type UserProfile, type LipidRecord, type MedicalCondition, type Patient } from '@/lib/types';
import * as React from 'react';

const initialProfile: UserProfile = { name: 'User', dob: '', gender: 'other', presentMedicalConditions: [], medication: '' };
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
  
  // This function is called by the new patient/[patientId] page
  const setPatientData = (patient: Patient) => {
    const patientProfile: UserProfile = {
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
  };

  const saveDataToLocalStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage`, error);
    }
  }

  const setProfile = (newProfile: UserProfile) => {
    setProfileState(newProfile);
    // When a profile is updated, we also need to update the master patient list
    // This part is complex because we don't know the patientId here directly
    // For now, we assume this is only called from patient view for MEDICATION changes
    // And we need a way to sync this back to the doctor-patients list.
  };
  
  const addMedicalCondition = (condition: Omit<MedicalCondition, 'id'>) => {
    const newCondition = { ...condition, id: Date.now().toString() };
    const updatedConditions = [...profile.presentMedicalConditions, newCondition];
    updatedConditions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const newProfile = { ...profile, presentMedicalConditions: updatedConditions };
    setProfileState(newProfile);
    // Need to sync back to master list
  };
  
  const removeMedicalCondition = (id: string) => {
    const updatedConditions = profile.presentMedicalConditions.filter(c => c.id !== id);
    const newProfile = { ...profile, presentMedicalConditions: updatedConditions };
    setProfileState(newProfile);
     // Need to sync back to master list
  };

  const setTips = (newTips: string[]) => {
    setTipsState(newTips);
    saveDataToLocalStorage('health-tips', newTips); // This can remain local to the session
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
     // Need to sync back to master list
  };

  const removeRecord = (id: string) => {
    const newRecords = records.filter((r) => r.id !== id);
    setRecordsState(newRecords);
     // Need to sync back to master list
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
     // Need to sync back to master list
  };

  const removeLipidRecord = (id: string) => {
    const newRecords = lipidRecords.filter((r) => r.id !== id);
    setLipidRecordsState(newRecords);
     // Need to sync back to master list
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
