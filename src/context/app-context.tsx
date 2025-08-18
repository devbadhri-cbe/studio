'use client';

import { type Hba1cRecord, type UserProfile, type LipidRecord, type MedicalCondition } from '@/lib/types';
import * as React from 'react';
import { parseISO, subMonths, subYears } from 'date-fns';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';

const initialProfile: UserProfile = { name: '', dob: '', presentMedicalConditions: [], medication: '' };

const getSampleData = () => {
  const now = new Date();
  const sampleProfile: UserProfile = {
    name: 'Jane Doe',
    dob: '1985-05-15',
    presentMedicalConditions: [
      { id: '1', date: subMonths(now, 12).toISOString(), condition: 'Type 2 Diabetes', icdCode: 'E11.9: Type 2 diabetes mellitus without complications' },
      { id: '2', date: subMonths(now, 24).toISOString(), condition: 'Hypertension', icdCode: 'I10: Essential (primary) hypertension' },
    ],
    medication: 'Metformin 500mg daily, Lisinopril 10mg daily',
  };

  const sampleHba1cRecords: Omit<Hba1cRecord, 'id'>[] = [
    { date: subMonths(now, 3), value: 6.8, medication: 'Metformin 500mg daily' },
    { date: subMonths(now, 6), value: 7.2, medication: 'Metformin 500mg daily' },
    { date: subMonths(now, 9), value: 7.5, medication: 'Metformin 500mg daily' },
  ];
  
  const sampleLipidRecords: Omit<LipidRecord, 'id'>[] = [
    { date: subYears(now, 1), ldl: 130, hdl: 45, triglycerides: 180, total: 240, medication: 'Lisinopril 10mg daily' },
    { date: subYears(now, 2), ldl: 140, hdl: 40, triglycerides: 200, total: 250, medication: 'Lisinopril 10mg daily' },
  ];

  return {
    profile: sampleProfile,
    records: sampleHba1cRecords.map((r, i) => ({ ...r, id: `sample-hba1c-${i}` })),
    lipidRecords: sampleLipidRecords.map((r, i) => ({ ...r, id: `sample-lipid-${i}` })),
    tips: [],
    dashboardView: 'hba1c' as DashboardView,
  };
}


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
        await signInAnonymously(auth);
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
            ...remoteData,
            // Ensure dates are parsed correctly
            profile: {
              ...initialProfile,
              ...remoteData.profile,
              presentMedicalConditions: remoteData.profile?.presentMedicalConditions?.map(c => ({...c, date: c.date ? new Date((c.date as any).seconds * 1000).toISOString() : new Date().toISOString() })) || [],
            },
            records: remoteData.records?.map(r => ({ ...r, date: r.date ? new Date((r.date as any).seconds * 1000) : new Date() })) || [],
            lipidRecords: remoteData.lipidRecords?.map(r => ({ ...r, date: r.date ? new Date((r.date as any).seconds * 1000) : new Date() })) || [],
          });
        } else {
          // Initialize with sample data for new user
          const initialData = getSampleData();
          setDoc(docRef, initialData);
          setData(initialData);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  const updateRemoteData = (updatedData: Partial<AppData>) => {
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      const dataToUpdate = { ...updatedData };
      if (dataToUpdate.profile?.presentMedicalConditions) {
        dataToUpdate.profile.presentMedicalConditions = dataToUpdate.profile.presentMedicalConditions.map(c => ({...c, date: new Date(c.date)}))
      }
      if (dataToUpdate.records) {
        dataToUpdate.records = dataToUpdate.records.map(r => ({...r, date: new Date(r.date)}))
      }
      if (dataToUpdate.lipidRecords) {
        dataToUpdate.lipidRecords = dataToUpdate.lipidRecords.map(r => ({...r, date: new Date(r.date)}))
      }
      setDoc(docRef, dataToUpdate, { merge: true });
    }
  };

  const setProfile = (newProfile: UserProfile) => {
    setData(prev => ({ ...prev, profile: newProfile }));
    updateRemoteData({ profile: newProfile });
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
    profile: {
      ...data.profile,
      presentMedicalConditions: data.profile.presentMedicalConditions.map(c => ({...c, date: c.date ? parseISO(c.date as string).toISOString() : new Date().toISOString() }))
    },
    setProfile,
    addMedicalCondition,
    removeMedicalCondition,
    records: data.records.map(r => ({...r, date: r.date ? parseISO(r.date as string) : new Date() })),
    addRecord,
    removeRecord,
    lipidRecords: data.lipidRecords.map(r => ({...r, date: r.date ? parseISO(r.date as string) : new Date() })),
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
