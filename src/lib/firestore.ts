

'use client';

import {
  doc,
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Patient } from './types';

const PATIENTS_COLLECTION = 'patients';

const convertTimestamps = (data: any): any => {
  const convertedData = { ...data };
  for (const key in convertedData) {
    if (convertedData[key] instanceof Timestamp) {
      convertedData[key] = convertedData[key].toDate().toISOString();
    } else if (Array.isArray(convertedData[key])) {
       convertedData[key] = convertedData[key].map(item => {
         if (item && item.date && item.date instanceof Timestamp) {
            return { ...item, date: item.date.toDate().toISOString() };
         }
         return item;
       });
    } else if (convertedData[key] && typeof convertedData[key] === 'object' && !(convertedData[key] instanceof Date)) {
       if (convertedData[key].seconds !== undefined && convertedData[key].nanoseconds !== undefined) {
          const ts = new Timestamp(convertedData[key].seconds, convertedData[key].nanoseconds);
          convertedData[key] = ts.toDate().toISOString();
       }
    }
  }
  return convertedData;
};


export async function getPatients(): Promise<any[]> {
  const q = query(collection(db, PATIENTS_COLLECTION));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...convertTimestamps(doc.data()) }));
}

export async function getPatient(id: string): Promise<any | null> {
  const docRef = doc(db, PATIENTS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    try {
      return { id: docSnap.id, ...convertTimestamps(docSnap.data()) };
    } catch (e) {
      console.error("getPatient: Error processing document:", e);
      return null;
    }
  }
  return null;
}

export async function addPatient(patientData: Omit<Patient, 'id' | 'status' | 'lastLogin' | 'doctorName' | 'totalCholesterolRecords' | 'ldlRecords' | 'hdlRecords' | 'triglyceridesRecords'>): Promise<Patient> {
    const docData = {
        ...patientData,
        doctorName: 'Dr. Badhrinathan N',
        lastLogin: null,
        hba1cRecords: [],
        fastingBloodGlucoseRecords: [],
        vitaminDRecords: [],
        thyroidRecords: [],
        hemoglobinRecords: [],
        weightRecords: [],
        bloodPressureRecords: [],
        totalCholesterolRecords: [],
        ldlRecords: [],
        hdlRecords: [],
        triglyceridesRecords: [],
        presentMedicalConditions: [],
        medication: [],
        enabledBiomarkers: {},
        createdAt: serverTimestamp(),
    }
  const docRef = await addDoc(collection(db, PATIENTS_COLLECTION), docData);
  
   return {
    ...docData,
    id: docRef.id,
    status: 'On Track',
  } as Patient;
}

export async function updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    const docRef = doc(db, PATIENTS_COLLECTION, id);
    
    const updateData: {[key: string]: any} = { ...updates };
    
    Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
            delete updateData[key];
        }
    });

    await updateDoc(docRef, updateData);
    const updatedPatient = await getPatient(id);
    if (!updatedPatient) throw new Error("Failed to update and retrieve patient.");
    return updatedPatient;
}

export async function deletePatient(id: string): Promise<void> {
  const docRef = doc(db, PATIENTS_COLLECTION, id);
  await deleteDoc(docRef);
}
