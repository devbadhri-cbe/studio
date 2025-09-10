

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

// --- Helper function to calculate patient status and latest records ---
const getPatientSummary = (patientData: Partial<Patient>): Partial<Patient> => {
    const summary: Partial<Patient> = {};

    const getLatestRecord = <T extends { date: string | Date }>(records?: T[]): T | null => {
        if (!records || records.length === 0) return null;
        return [...records].sort((a, b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())[0];
    };

    summary.lastHba1c = getLatestRecord(patientData.hba1cRecords) || null;
    summary.lastVitaminD = getLatestRecord(patientData.vitaminDRecords) || null;
    summary.lastThyroid = getLatestRecord(patientData.thyroidRecords) || null;
    summary.lastBloodPressure = getLatestRecord(patientData.bloodPressureRecords) || null;
    summary.lastHemoglobin = getLatestRecord(patientData.hemoglobinRecords) || null;
    summary.lastFastingBloodGlucose = getLatestRecord(patientData.fastingBloodGlucoseRecords) || null;

    // Status Calculation Logic
    const lastBP = summary.lastBloodPressure;
    const needsReview = patientData.presentMedicalConditions?.some(c => c.status === 'pending_review');

    if (lastBP && (lastBP.systolic >= 140 || lastBP.diastolic >= 90)) {
        summary.status = 'Urgent';
    } else if (needsReview) {
        summary.status = 'Needs Review';
    } else {
        summary.status = 'On Track';
    }

    return summary;
}


export async function getPatient(id: string): Promise<any | null> {
  const db = getFirebaseDb();
  const docRef = doc(db, PATIENTS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    try {
      const patientData = { id: docSnap.id, ...convertTimestamps(docSnap.data()) };
      const summary = getPatientSummary(patientData);
      return { ...patientData, ...summary };
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
      const patientData = { id: doc.id, ...convertTimestamps(doc.data()) };
      const summary = getPatientSummary(patientData);
      return { ...patientData, ...summary } as Patient;
  });
}


export async function addPatient(patientData: Omit<Patient, 'id' | 'status' | 'lastLogin' | 'doctorPhone' | 'totalCholesterolRecords' | 'ldlRecords' | 'hdlRecords' | 'triglyceridesRecords' | 'doctorUid' | 'doctorName' | 'doctorEmail' | 'thyroxineRecords' | 'serumCreatinineRecords'>): Promise<Patient> {
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
        vitaminDRecords: [],
        thyroidRecords: [],
        thyroxineRecords: [],
        serumCreatinineRecords: [],
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
        lastVitaminD: null,
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

    // Fetch the existing document to ensure the summary is based on the full data.
    const currentPatientData = await getPatient(id);
    if (!currentPatientData) throw new Error("Patient not found for update.");

    // Merge the updates into the existing data to get a complete picture.
    const mergedData = { ...currentPatientData, ...updates };
    
    // Recalculate summary fields based on the complete, merged data.
    const summaryUpdates = getPatientSummary(mergedData);

    const updateData: {[key: string]: any} = { ...updates, ...summaryUpdates };
    
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

// This function is no longer needed in the single-doctor model but is kept for potential future use.
export async function getPatientsPaginated(
  doctorUid: string,
  lastVisible: any | null,
  pageSize: number
): Promise<{ patients: Patient[]; lastVisible: any | null }> {
  const db = getFirebaseDb();
  let q;
  const patientsCollection = collection(db, PATIENTS_COLLECTION);
  const baseQuery = [
    where('doctorUid', '==', doctorUid),
    orderBy('name'), 
    limit(pageSize)
];

  if (lastVisible) {
    q = query(patientsCollection, ...baseQuery, startAfter(lastVisible));
  } else {
    q = query(patientsCollection, ...baseQuery);
  }

  const documentSnapshots = await getDocs(q);
  
  const patients = documentSnapshots.docs.map(doc => {
    const patientData = { id: doc.id, ...convertTimestamps(doc.data()) };
    const summary = getPatientSummary(patientData);
    return { ...patientData, ...summary } as Patient;
  });

  const newLastVisible = documentSnapshots.docs.length === pageSize ? documentSnapshots.docs[documentSnapshots.docs.length - 1] : null;

  return { patients, lastVisible: newLastVisible };
}
