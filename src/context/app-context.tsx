'use client';

import { type Hba1cRecord, type UserProfile } from '@/lib/types';
import * as React from 'react';

const initialProfile: UserProfile = { name: '', dob: '', medication: '' };

interface AppContextType {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  records: Hba1cRecord[];
  addRecord: (record: Omit<Hba1cRecord, 'id'>) => void;
  removeRecord: (id: string) => void;
  tips: string[];
  setTips: (tips: string[]) => void;
  isClient: boolean;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = React.useState<UserProfile>(initialProfile);
  const [records, setRecordsState] = React.useState<Hba1cRecord[]>([]);
  const [tips, setTipsState] = React.useState<string[]>([]);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    try {
      const storedProfile = localStorage.getItem('gg-profile');
      if (storedProfile) setProfileState(JSON.parse(storedProfile));

      const storedRecords = localStorage.getItem('gg-records');
      if (storedRecords) {
        setRecordsState(JSON.parse(storedRecords).map((r: Hba1cRecord) => ({ ...r, date: new Date(r.date) })));
      }

      const storedTips = localStorage.getItem('gg-tips');
      if (storedTips) setTipsState(JSON.parse(storedTips));
    } catch (error) {
      console.error('Failed to parse from localStorage', error);
      // Reset to default if parsing fails
      localStorage.removeItem('gg-profile');
      localStorage.removeItem('gg-records');
      localStorage.removeItem('gg-tips');
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

  const addRecord = (record: Omit<Hba1cRecord, 'id'>) => {
    setRecordsState((prev) => {
      const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date) };
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

  const value = {
    profile,
    setProfile,
    records,
    addRecord,
    removeRecord,
    tips,
    setTips,
    isClient,
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
