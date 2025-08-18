'use client';

import { type Hba1cRecord, type UserProfile, type LipidRecord } from '@/lib/types';
import * as React from 'react';
import { parseISO } from 'date-fns';

const initialProfile: UserProfile = { name: '', dob: '', presentMedicalConditions: '', medication: '' };

type DashboardView = 'hba1c' | 'lipids';

interface AppContextType {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
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
  const [isClient, setIsClient] = React.useState(false);
  const [dashboardView, setDashboardView] = React.useState<DashboardView>('hba1c');

  React.useEffect(() => {
    setIsClient(true);
    try {
      const storedProfile = localStorage.getItem('gg-profile');
      if (storedProfile) setProfileState(JSON.parse(storedProfile));

      const storedRecords = localStorage.getItem('gg-records');
      if (storedRecords) {
        setRecordsState(JSON.parse(storedRecords));
      }

      const storedLipidRecords = localStorage.getItem('gg-lipid-records');
      if (storedLipidRecords) {
        setLipidRecordsState(JSON.parse(storedLipidRecords));
      }

      const storedTips = localStorage.getItem('gg-tips');
      if (storedTips) setTipsState(JSON.parse(storedTips));

      const storedView = localStorage.getItem('gg-dashboard-view');
      if (storedView) setDashboardView(storedView as DashboardView);

    } catch (error) {
      console.error('Failed to parse from localStorage', error);
      localStorage.removeItem('gg-profile');
      localStorage.removeItem('gg-records');
      localStorage.removeItem('gg-lipid-records');
      localStorage.removeItem('gg-tips');
      localStorage.removeItem('gg-dashboard-view');
    }
  }, []);

  const setProfile = (newProfile: UserProfile) => {
    setProfileState(newProfile);
    if (isClient) localStorage.setItem('gg-profile', JSON.stringify(newProfile));
  };

  const setTips = (newTips: string[]) => {
    setTipsState(newTips);
    if (isClient) localStorage.setItem('gg-tips', JSON.stringify(newTips));
  };

  const handleSetDashboardView = (view: DashboardView) => {
    setDashboardView(view);
    if(isClient) localStorage.setItem('gg-dashboard-view', view);
    // Reset tips when view changes
    setTips([]);
  }

  const addRecord = (record: Omit<Hba1cRecord, 'id' | 'medication'>) => {
    setRecordsState((prev) => {
      const newRecord = { 
        ...record, 
        id: Date.now().toString(), 
        date: new Date(record.date).toISOString(), 
        medication: profile.medication || 'N/A' 
      };
      const newRecords = [...prev, newRecord];
      if (isClient) localStorage.setItem('gg-records', JSON.stringify(newRecords));
      return newRecords;
    });
  };

  const removeRecord = (id: string) => {
    setRecordsState((prev) => {
      const newRecords = prev.filter((r) => r.id !== id);
      if (isClient) localStorage.setItem('gg-records', JSON.stringify(newRecords));
      return newRecords;
    });
  };

  const addLipidRecord = (record: Omit<LipidRecord, 'id' | 'medication'>) => {
    setLipidRecordsState((prev) => {
      const newRecord = {
        ...record,
        id: Date.now().toString(),
        date: new Date(record.date).toISOString(),
        medication: profile.medication || 'N/A',
      };
      const newRecords = [...prev, newRecord];
      if (isClient) localStorage.setItem('gg-lipid-records', JSON.stringify(newRecords));
      return newRecords;
    });
  };

  const removeLipidRecord = (id: string) => {
    setLipidRecordsState((prev) => {
      const newRecords = prev.filter((r) => r.id !== id);
      if (isClient) localStorage.setItem('gg-lipid-records', JSON.stringify(newRecords));
      return newRecords;
    });
  };
  
  const value = {
    profile,
    setProfile,
    records: records.map(r => ({...r, date: r.date ? parseISO(r.date as string) : new Date() })),
    addRecord,
    removeRecord,
    lipidRecords: lipidRecords.map(r => ({...r, date: r.date ? parseISO(r.date as string) : new Date() })),
    addLipidRecord,
    removeLipidRecord,
    tips,
    setTips,
    isClient,
    dashboardView,
    setDashboardView: handleSetDashboardView,
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
