'use client';

import { type Hba1cRecord, type UserProfile, type LipidRecord, type MedicalCondition } from '@/lib/types';
import * as React from 'react';

const initialProfile: UserProfile = { name: 'Jane Doe', dob: '1980-01-01', gender: 'female', presentMedicalConditions: [], medication: 'Metformin 500mg' };

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
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = React.useState<UserProfile>(initialProfile);
  const [records, setRecordsState] = React.useState<Hba1cRecord[]>([]);
  const [lipidRecords, setLipidRecordsState] = React.useState<LipidRecord[]>([]);
  const [tips, setTipsState] = React.useState<string[]>([]);
  const [dashboardView, setDashboardViewState] = React.useState<DashboardView>('hba1c');
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    // Load from localStorage if available
    try {
      const storedProfile = localStorage.getItem('health-profile');
      if (storedProfile) {
        setProfileState(JSON.parse(storedProfile));
      } else {
        setProfileState(initialProfile);
      }
      const storedRecords = localStorage.getItem('health-records');
      if (storedRecords) {
        setRecordsState(JSON.parse(storedRecords));
      }
      const storedLipidRecords = localStorage.getItem('health-lipid-records');
      if (storedLipidRecords) {
        setLipidRecordsState(JSON.parse(storedLipidRecords));
      }
      const storedTips = localStorage.getItem('health-tips');
      if (storedTips) {
        setTipsState(JSON.parse(storedTips));
      }
      // For simplicity, we'll default to hba1c view and remove the stored view logic for now
    } catch (error) {
      console.error("Failed to parse from localStorage", error);
    }
  }, []);

  const saveDataToLocalStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage`, error);
    }
  }

  const setProfile = (newProfile: UserProfile) => {
    setProfileState(newProfile);
    saveDataToLocalStorage('health-profile', newProfile);
  };
  
  const addMedicalCondition = (condition: Omit<MedicalCondition, 'id'>) => {
    const newCondition = { ...condition, id: Date.now().toString() };
    const updatedConditions = [...profile.presentMedicalConditions, newCondition];
    updatedConditions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const newProfile = { ...profile, presentMedicalConditions: updatedConditions };
    setProfile(newProfile);
  };
  
  const removeMedicalCondition = (id: string) => {
    const updatedConditions = profile.presentMedicalConditions.filter(c => c.id !== id);
    const newProfile = { ...profile, presentMedicalConditions: updatedConditions };
    setProfile(newProfile);
  };

  const setTips = (newTips: string[]) => {
    setTipsState(newTips);
    saveDataToLocalStorage('health-tips', newTips);
  };

  const setDashboardView = (view: DashboardView) => {
    setDashboardViewState(view);
    saveDataToLocalStorage('health-dashboard-view', view);
    setTips([]); // Reset tips on view change
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
    saveDataToLocalStorage('health-records', newRecords);
  };

  const removeRecord = (id: string) => {
    const newRecords = records.filter((r) => r.id !== id);
    setRecordsState(newRecords);
    saveDataToLocalStorage('health-records', newRecords);
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
    saveDataToLocalStorage('health-lipid-records', newRecords);
  };

  const removeLipidRecord = (id: string) => {
    const newRecords = lipidRecords.filter((r) => r.id !== id);
    setLipidRecordsState(newRecords);
    saveDataToLocalStorage('health-lipid-records', newRecords);
  };
  
  const value = {
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
