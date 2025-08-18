'use client';

import { type Hba1cRecord, type UserProfile, type LipidRecord, type MedicalCondition } from '@/lib/types';
import * as React from 'react';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

const initialProfile: UserProfile = { name: '', dob: '', presentMedicalConditions: [], medication: '' };

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

interface AppData {
  profile: UserProfile;
  records: Hba1cRecord[];
  lipidRecords: LipidRecord[];
  tips: string[];
  dashboardView: DashboardView;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [data, setData] = React.useState<AppData>({
    profile: initialProfile,
    records: [],
    lipidRecords: [],
    tips: [],
    dashboardView: 'hba1c',
  });
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error('Anonymous sign-in failed', error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const remoteData = docSnap.data() as AppData;
           setData({
            profile: {
              ...initialProfile,
              ...(remoteData.profile || {}),
              presentMedicalConditions: remoteData.profile?.presentMedicalConditions?.map(c => ({...c, date: c.date ? (c.date as any).toDate().toISOString() : new Date().toISOString() })) || [],
            },
            records: remoteData.records?.map(r => ({ ...r, date: r.date ? (r.date as any).toDate().toISOString() : new Date().toISOString() })) || [],
            lipidRecords: remoteData.lipidRecords?.map(r => ({ ...r, date: r.date ? (r.date as any).toDate().toISOString() : new Date().toISOString() })) || [],
            tips: remoteData.tips || [],
            dashboardView: remoteData.dashboardView || 'hba1c',
          });
        } else {
          // If no data exists, set the initial empty state
           const newDocData = {
            profile: initialProfile,
            records: [],
            lipidRecords: [],
            tips: [],
            dashboardView: 'hba1c',
          };
          setDoc(doc(db, 'users', user.uid), newDocData);
          setData(newDocData);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  const updateRemoteData = async (updatedData: Partial<AppData>) => {
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      const dataToUpdate: any = { ...updatedData };
      if (dataToUpdate.profile?.presentMedicalConditions) {
        dataToUpdate.profile.presentMedicalConditions = dataToUpdate.profile.presentMedicalConditions.map(c => ({...c, date: Timestamp.fromDate(new Date(c.date))}))
      }
      if (dataToUpdate.records) {
        dataToUpdate.records = dataToUpdate.records.map(r => ({...r, date: Timestamp.fromDate(new Date(r.date))}))
      }
      if (dataToUpdate.lipidRecords) {
        dataToUpdate.lipidRecords = dataToUpdate.lipidRecords.map(r => ({...r, date: Timestamp.fromDate(new Date(r.date))}))
      }
      // Use setDoc with merge: true to create or update the document
      await setDoc(docRef, dataToUpdate, { merge: true });
    }
  };
  
  const setProfile = (newProfile: UserProfile) => {
    const updatedProfile = { ...data.profile, ...newProfile };
    setData(prev => ({ ...prev, profile: updatedProfile }));
    updateRemoteData({ profile: updatedProfile });
  };
  
  const addMedicalCondition = (condition: Omit<MedicalCondition, 'id'>) => {
    const newCondition = { ...condition, id: Date.now().toString() };
    const updatedConditions = [...data.profile.presentMedicalConditions, newCondition];
    updatedConditions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const newProfile = { ...data.profile, presentMedicalConditions: updatedConditions };
    setData(prev => ({ ...prev, profile: newProfile }));
    updateRemoteData({ profile: newProfile });
  };
  
  const removeMedicalCondition = (id: string) => {
    const updatedConditions = data.profile.presentMedicalConditions.filter(c => c.id !== id);
    const newProfile = { ...data.profile, presentMedicalConditions: updatedConditions };
    setData(prev => ({...prev, profile: newProfile }));
    updateRemoteData({ profile: newProfile });
  };

  const setTips = (newTips: string[]) => {
    setData(prev => ({ ...prev, tips: newTips }));
    updateRemoteData({ tips: newTips });
  };

  const handleSetDashboardView = (view: DashboardView) => {
    setData(prev => ({ ...prev, dashboardView: view, tips: [] })); // Reset tips on view change
    updateRemoteData({ dashboardView: view, tips: [] });
  }

  const addRecord = (record: Omit<Hba1cRecord, 'id' | 'medication'>) => {
    const newRecord = { 
      ...record, 
      id: Date.now().toString(), 
      date: new Date(record.date).toISOString(), 
      medication: data.profile.medication || 'N/A' 
    };
    const newRecords = [...data.records, newRecord];
    setData(prev => ({ ...prev, records: newRecords }));
    updateRemoteData({ records: newRecords as any[] });
  };

  const removeRecord = (id: string) => {
    const newRecords = data.records.filter((r) => r.id !== id);
    setData(prev => ({ ...prev, records: newRecords }));
    updateRemoteData({ records: newRecords as any[] });
  };

  const addLipidRecord = (record: Omit<LipidRecord, 'id' | 'medication'>) => {
    const newRecord = {
      ...record,
      id: Date.now().toString(),
      date: new Date(record.date).toISOString(),
      medication: data.profile.medication || 'N/A',
    };
    const newRecords = [...data.lipidRecords, newRecord];
    setData(prev => ({ ...prev, lipidRecords: newRecords }));
    updateRemoteData({ lipidRecords: newRecords as any[] });
  };

  const removeLipidRecord = (id: string) => {
    const newRecords = data.lipidRecords.filter((r) => r.id !== id);
    setData(prev => ({ ...prev, lipidRecords: newRecords }));
    updateRemoteData({ lipidRecords: newRecords as any[] });
  };
  
  const value = {
    profile: data.profile,
    setProfile,
    addMedicalCondition,
    removeMedicalCondition,
    records: data.records,
    addRecord,
    removeRecord,
    lipidRecords: data.lipidRecords,
    addLipidRecord,
    removeLipidRecord,
    tips: data.tips,
    setTips,
    isClient,
    dashboardView: data.dashboardView,
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
