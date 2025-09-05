

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
import { calculateAge, calculateBmi } from './utils';

const PATIENTS_COLLECTION = 'patients';

const getPatientStatus = (patientData: Partial<Patient>): 'On Track' | 'Needs Review' | 'Urgent' => {
  const lastBP = patientData.bloodPressureRecords && patientData.bloodPressureRecords.length > 0 
    ? [...patientData.bloodPressureRecords].sort((a,b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())[0] 
    : null;
    
  const needsReview = patientData.presentMedicalConditions?.some(c => c.status === 'pending_review');

  if (lastBP && (lastBP.systolic >= 140 || lastBP.diastolic >= 90)) return 'Urgent';
  if (needsReview) return 'Needs Review';
  
  return 'On Track';
};


const processPatientDoc = (doc: any): Patient => {
  let data = doc.data();

  data = JSON.parse(JSON.stringify(data));

  const sanitizeRecords = (records: any[]) => {
    if (!Array.isArray(records)) return [];
    return records.map(r => {
      if (r && r.date) {
        const dateObj = r.date.seconds ? new Timestamp(r.date.seconds, r.date.nanoseconds).toDate() : new Date(r.date);
        r.date = !isNaN(dateObj.getTime()) ? dateObj.toISOString() : new Date(0).toISOString();
      }
      return r;
    });
  }

  const hba1cRecords = sanitizeRecords(data.hba1cRecords || []);
  const fastingBloodGlucoseRecords = sanitizeRecords(data.fastingBloodGlucoseRecords || []);
  const vitaminDRecords = sanitizeRecords(data.vitaminDRecords || []);
  const thyroidRecords = sanitizeRecords(data.thyroidRecords || []);
  const weightRecords = sanitizeRecords(data.weightRecords || []);
  const bloodPressureRecords = sanitizeRecords(data.bloodPressureRecords || []);
  const hemoglobinRecords = sanitizeRecords(data.hemoglobinRecords || []);
  const presentMedicalConditions = sanitizeRecords(data.presentMedicalConditions || []);


  
  const lastHba1c = hba1cRecords.length > 0 ? [...hba1cRecords].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;
  const lastVitaminD = vitaminDRecords.length > 0 ? [...vitaminDRecords].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;
  const lastThyroid = thyroidRecords.length > 0 ? [...thyroidRecords].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;
  const lastBloodPressure = bloodPressureRecords.length > 0 ? [...bloodPressureRecords].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;
  const lastHemoglobin = hemoglobinRecords.length > 0 ? [...hemoglobinRecords].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;

  const latestWeight = weightRecords.length > 0 ? [...weightRecords].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;
  const bmi = (latestWeight && data.height) ? calculateBmi(latestWeight?.value, data.height) : null;

  const dobTimestamp = data.dob && data.dob.seconds ? new Timestamp(data.dob.seconds, data.dob.nanoseconds).toDate() : new Date(data.dob);
  const lastLoginTimestamp = data.lastLogin && data.lastLogin.seconds ? new Timestamp(data.lastLogin.seconds, data.lastLogin.nanoseconds).toDate() : (data.lastLogin ? new Date(data.lastLogin) : null);

  const patientData: Partial<Patient> = {
    ...data,
    id: doc.id,
    dob: !isNaN(dobTimestamp.getTime()) ? dobTimestamp.toISOString() : new Date(0).toISOString(),
    lastLogin: lastLoginTimestamp && !isNaN(lastLoginTimestamp.getTime()) ? lastLoginTimestamp.toISOString() : undefined,
    hba1cRecords,
    fastingBloodGlucoseRecords,
    vitaminDRecords,
    thyroidRecords,
    weightRecords,
    bloodPressureRecords,
    presentMedicalConditions,
    hemoglobinRecords,
    bmi,
  };

  const status = getPatientStatus(patientData);
  
  return {
    ...patientData,
    status,
    lastHba1c: lastHba1c ? { value: lastHba1c.value, date: lastHba1c.date } : null,
    lastVitaminD: lastVitaminD ? { value: lastVitaminD.value, date: lastVitaminD.date } : null,
    lastThyroid: lastThyroid ? { tsh: lastThyroid.tsh, date: lastThyroid.date } : null,
    lastBloodPressure: lastBloodPressure ? { systolic: lastBloodPressure.systolic, diastolic: lastBloodPressure.diastolic, date: lastBloodPressure.date } : null,
    lastHemoglobin: lastHemoglobin ? { value: lastHemoglobin.hemoglobin, date: lastHemoglobin.date } : null,
  } as Patient;
};


export async function getPatients(): Promise<Patient[]> {
  const q = query(collection(db, PATIENTS_COLLECTION));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(processPatientDoc);
}

export async function getPatient(id: string): Promise<Patient | null> {
  const docRef = doc(db, PATIENTS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    try {
      const patient = processPatientDoc(docSnap);
      return patient;
    } catch (e) {
      console.error("getPatient: Error processing document:", e);
      return null;
    }
  }
  return null;
}

export async function addPatient(patientData: Omit<Patient, 'id' | 'status' | 'lastLogin' | 'doctorName'>): Promise<Patient> {
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
        presentMedicalConditions: [],
        medication: [],
        enabledDashboards: ['vitaminD', 'thyroid', 'hypertension'],
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
    if (updates.dob && typeof updates.dob === 'string') {
        updateData.dob = new Date(updates.dob);
    }
    if (updates.lastLogin && typeof updates.lastLogin === 'string') {
        updateData.lastLogin = new Date(updates.lastLogin);
    }
    ['hba1cRecords', 'fastingBloodGlucoseRecords', 'vitaminDRecords', 'thyroidRecords', 'weightRecords', 'bloodPressureRecords', 'presentMedicalConditions', 'hemoglobinRecords'].forEach(key => {
        if (updateData[key] && Array.isArray(updateData[key])) {
            updateData[key] = updateData[key].map((item: any) => ({
                ...item,
                date: item.date && typeof item.date === 'string' ? new Date(item.date) : (item.date || new Date())
            }));
        }
    });

    // Remove undefined fields to prevent Firestore errors
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

// Doctor specific functions are removed for single-doctor model
