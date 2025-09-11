

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
  limit,
  startAfter,
  where,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import type { Patient } from './types';
import { doctorDetails } from './doctor-data';

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

export async function getPatient(id: string): Promise<any | null> {
  const db = getFirebaseDb();
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

export async function getAllPatients(): Promise<Patient[]> {
  const db = getFirebaseDb();
  const q = query(collection(db, PATIENTS_COLLECTION), orderBy('name'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
      return { id: doc.id, ...convertTimestamps(doc.data()) } as Patient;
  });
}

export async function getPatientsPaginated(
  pageParam: { lastVisible: Patient | null; limit: number },
  doctorUid: string
): Promise<{ patients: Patient[]; nextCursor: Patient | null }> {
  const db = getFirebaseDb();
  const patients: Patient[] = [];
  let q;

  if (pageParam.lastVisible) {
    const lastVisibleDoc = await getDoc(doc(db, PATIENTS_COLLECTION, pageParam.lastVisible.id));
    q = query(
      collection(db, PATIENTS_COLLECTION),
      where('doctorUid', '==', doctorUid),
      orderBy('name'),
      startAfter(lastVisibleDoc),
      limit(pageParam.limit)
    );
  } else {
    q = query(
      collection(db, PATIENTS_COLLECTION),
      where('doctorUid', '==', doctorUid),
      orderBy('name'),
      limit(pageParam.limit)
    );
  }

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    patients.push({ id: doc.id, ...convertTimestamps(doc.data()) } as Patient);
  });

  const nextCursor = querySnapshot.docs.length === pageParam.limit
    ? patients[patients.length - 1]
    : null;

  return { patients, nextCursor };
}


export async function addPatient(patientData: Omit<Patient, 'id' | 'status' | 'lastLogin' | 'doctorPhone' | 'totalCholesterolRecords' | 'ldlRecords' | 'hdlRecords' | 'triglyceridesRecords' | 'doctorUid' | 'doctorName' | 'doctorEmail' | 'thyroxineRecords' | 'serumCreatinineRecords' | 'uricAcidRecords'>): Promise<Patient> {
    const db = getFirebaseDb();
    const docData = {
        ...patientData,
        doctorUid: doctorDetails.uid,
        doctorName: doctorDetails.name,
        doctorEmail: doctorDetails.email,
        doctorPhone: '',
        lastLogin: null,
        hba1cRecords: [],
        fastingBloodGlucoseRecords: [],
        thyroidRecords: [],
        thyroxineRecords: [],
        serumCreatinineRecords: [],
        uricAcidRecords: [],
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
        // Initialize summary fields
        bmi: null,
        lastHba1c: null,
        lastThyroid: null,
        lastBloodPressure: null,
        lastHemoglobin: null,
        lastFastingBloodGlucose: null,
        status: 'On Track' as const,
    }
  const docRef = await addDoc(collection(db, PATIENTS_COLLECTION), docData);
  const newPatientDoc = await getPatient(docRef.id);
  if (!newPatientDoc) {
      throw new Error("Failed to create and retrieve new patient.");
  }
  return newPatientDoc;
}

export async function updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    const db = getFirebaseDb();
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
  const db = getFirebaseDb();
  const docRef = doc(db, PATIENTS_COLLECTION, id);
  await deleteDoc(docRef);
}
    
