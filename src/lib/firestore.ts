
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
import { calculateAge, calculateBmi, calculateEgfr } from './utils';

const PATIENTS_COLLECTION = 'patients';

const getPatientStatus = (patientData: Partial<Patient>): 'On Track' | 'Needs Review' | 'Urgent' => {
  const lastHba1c = patientData.records && patientData.records.length > 0 
    ? [...patientData.records].sort((a,b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())[0] 
    : null;
    
  const lastBP = patientData.bloodPressureRecords && patientData.bloodPressureRecords.length > 0 
    ? [...patientData.bloodPressureRecords].sort((a,b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())[0] 
    : null;
    
  const lastRenal = patientData.renalRecords && patientData.renalRecords.length > 0
    ? [...patientData.renalRecords].sort((a,b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())[0]
    : null;
    
  const needsReview = patientData.presentMedicalConditions?.some(c => c.status === 'pending_review');

  if (lastHba1c && lastHba1c.value >= 7.0) return 'Urgent';
  if (lastBP && (lastBP.systolic >= 140 || lastBP.diastolic >= 90)) return 'Urgent';
  if (lastRenal && (lastRenal.eGFR && lastRenal.eGFR < 30)) return 'Urgent';
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

  const records = sanitizeRecords(data.records);
  const lipidRecords = sanitizeRecords(data.lipidRecords);
  const vitaminDRecords = sanitizeRecords(data.vitaminDRecords);
  const thyroidRecords = sanitizeRecords(data.thyroidRecords);
  const weightRecords = sanitizeRecords(data.weightRecords);
  const bloodPressureRecords = sanitizeRecords(data.bloodPressureRecords);
  const renalRecords = sanitizeRecords(data.renalRecords);
  const anemiaRecords = sanitizeRecords(data.anemiaRecords);
  const nutritionRecords = sanitizeRecords(data.nutritionRecords);
  const presentMedicalConditions = sanitizeRecords(data.presentMedicalConditions);
  const electrolyteRecords = sanitizeRecords(data.electrolyteRecords);
  const mineralBoneDiseaseRecords = sanitizeRecords(data.mineralBoneDiseaseRecords);


  const age = calculateAge(data.dob);
  const processedRenalRecords = renalRecords.map((record: any) => {
    if (record.serumCreatinine && age && data.gender) {
        record.eGFR = calculateEgfr(record.serumCreatinine, record.serumCreatinineUnits, age, data.gender);
    }
    return record;
  });

  const lastHba1c = records.length > 0 ? [...records].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;
  const lastLipid = lipidRecords.length > 0 ? [...lipidRecords].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;
  const lastVitaminD = vitaminDRecords.length > 0 ? [...vitaminDRecords].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;
  const lastThyroid = thyroidRecords.length > 0 ? [...thyroidRecords].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;
  const lastBloodPressure = bloodPressureRecords.length > 0 ? [...bloodPressureRecords].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;
  const lastRenal = processedRenalRecords.length > 0 ? [...processedRenalRecords].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;
  const lastHemoglobin = anemiaRecords.length > 0 ? [...anemiaRecords].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;
  const lastAlbumin = nutritionRecords.length > 0 ? [...nutritionRecords].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;

  const latestWeight = weightRecords.length > 0 ? [...weightRecords].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;
  const bmi = calculateBmi(latestWeight?.value, data.height);

  const dobTimestamp = data.dob && data.dob.seconds ? new Timestamp(data.dob.seconds, data.dob.nanoseconds).toDate() : new Date(data.dob);
  const lastLoginTimestamp = data.lastLogin && data.lastLogin.seconds ? new Timestamp(data.lastLogin.seconds, data.lastLogin.nanoseconds).toDate() : (data.lastLogin ? new Date(data.lastLogin) : null);

  const patientData: Partial<Patient> = {
    ...data,
    id: doc.id,
    dob: !isNaN(dobTimestamp.getTime()) ? dobTimestamp.toISOString() : new Date(0).toISOString(),
    lastLogin: lastLoginTimestamp && !isNaN(lastLoginTimestamp.getTime()) ? lastLoginTimestamp.toISOString() : undefined,
    records,
    lipidRecords,
    vitaminDRecords,
    thyroidRecords,
    renalRecords: processedRenalRecords,
    weightRecords,
    bloodPressureRecords,
    presentMedicalConditions,
    anemiaRecords,
    nutritionRecords,
    electrolyteRecords,
    mineralBoneDiseaseRecords,
    bmi,
  };

  const status = getPatientStatus(patientData);
  
  return {
    ...patientData,
    status,
    lastHba1c: lastHba1c ? { value: lastHba1c.value, date: lastHba1c.date } : null,
    lastLipid: lastLipid ? { ldl: lastLipid.ldl, date: lastLipid.date } : null,
    lastVitaminD: lastVitaminD ? { value: lastVitaminD.value, date: lastVitaminD.date } : null,
    lastThyroid: lastThyroid ? { tsh: lastThyroid.tsh, date: lastThyroid.date } : null,
    lastBloodPressure: lastBloodPressure ? { systolic: lastBloodPressure.systolic, diastolic: lastBloodPressure.diastolic, date: lastBloodPressure.date } : null,
    lastRenal: lastRenal ? { eGFR: lastRenal.eGFR, uacr: lastRenal.uacr, date: lastRenal.date } : null,
    lastHemoglobin: lastHemoglobin ? { value: lastHemoglobin.hemoglobin, date: lastHemoglobin.date } : null,
    lastAlbumin: lastAlbumin ? { value: lastAlbumin.albumin, date: lastAlbumin.date } : null,
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
    return processPatientDoc(docSnap);
  }
  return null;
}

export async function addPatient(patientData: Omit<Patient, 'id' | 'status' | 'lastHba1c' | 'lastLipid' | 'lastLogin' | 'doctorName'>): Promise<Patient> {
    const docData = {
        ...patientData,
        doctorName: 'Dr. Badhrinathan N',
        lastLogin: null,
        records: [],
        lipidRecords: [],
        vitaminDRecords: [],
        thyroidRecords: [],
        renalRecords: [],
        electrolyteRecords: [],
        mineralBoneDiseaseRecords: [],
        anemiaRecords: [],
        nutritionRecords: [],
        weightRecords: [],
        bloodPressureRecords: [],
        presentMedicalConditions: [],
        medication: [],
        dashboardSuggestions: [],
        enabledDashboards: ['hba1c', 'lipids', 'vitaminD', 'thyroid', 'hypertension', 'renal'],
        createdAt: serverTimestamp(),
    }
  const docRef = await addDoc(collection(db, PATIENTS_COLLECTION), docData);
  
   return {
    ...docData,
    id: docRef.id,
    status: 'On Track',
    lastHba1c: null,
    lastLipid: null,
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
    ['records', 'lipidRecords', 'vitaminDRecords', 'thyroidRecords', 'renalRecords', 'weightRecords', 'bloodPressureRecords', 'presentMedicalConditions', 'anemiaRecords', 'nutritionRecords', 'electrolyteRecords', 'mineralBoneDiseaseRecords'].forEach(key => {
        if (updateData[key] && Array.isArray(updateData[key])) {
            updateData[key] = updateData[key].map((item: any) => ({
                ...item,
                date: item.date && typeof item.date === 'string' ? new Date(item.date) : (item.date || new Date())
            }));
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
