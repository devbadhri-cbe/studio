'use client';

import { type Hba1cRecord, type UserProfile } from '@/lib/types';
import * as React from 'react';
import { parseISO } from 'date-fns';

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
        // Dates are stored as ISO strings, so we need to parse them back to Date objects
        setRecordsState(JSON.parse(storedRecords).map((r: Hba1cRecord) => ({ ...r, date: parseISO(r.date as string) })));
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
      // Ensure date is in ISO format for consistent storage
      const newRecord = { ...record, id: Date.now().toString(), date: new Date(record.date).toISOString() };
      const newRecords = [...prev, newRecord].map(r => ({...r, date: new Date(r.date)}));

      // When saving to localStorage, date objects are automatically converted to ISO strings
      if (isClient) localStorage.setItem('gg-records', JSON.stringify(newRecords));
      
      return newRecords.map(r => ({...r, date: parseISO(r.date as string)}));
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
    records: records.map(r => ({...r, date: new Date(r.date)})),
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
