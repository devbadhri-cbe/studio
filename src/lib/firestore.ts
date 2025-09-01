

'use client';

import { db } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, setDoc, deleteDoc } from 'firebase/firestore';
import type { Patient } from './types';
import { calculateBmi } from './utils';
import { Hba1cRecord } from './types';
import { LipidRecord } from './types';
import { VitaminDRecord } from './types';
import { ThyroidRecord } from './types';
import { WeightRecord } from './types';
import { MedicalCondition } from './types';
import { Medication } from './types';
import { countries } from './countries';

const PATIENTS_COLLECTION = 'patients';

const recalculatePatientStatus = (patient: Patient): Patient => {
    const updatedPatient = { ...patient };
    
    const sortedHba1c = [...(updatedPatient.records || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const sortedLipids = [...(updatedPatient.lipidRecords || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const sortedVitaminD = [...(updatedPatient.vitaminDRecords || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const sortedThyroid = [...(updatedPatient.thyroidRecords || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const sortedBloodPressure = [...(updatedPatient.bloodPressureRecords || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const sortedWeight = [...(updatedPatient.weightRecords || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    updatedPatient.lastHba1c = sortedHba1c[0] ? { value: sortedHba1c[0].value, date: new Date(sortedHba1c[0].date).toISOString() } : null;
    updatedPatient.lastLipid = sortedLipids[0] ? { ldl: sortedLipids[0].ldl, date: new Date(sortedLipids[0].date).toISOString() } : null;
    updatedPatient.lastVitaminD = sortedVitaminD[0] ? { value: sortedVitaminD[0].value, date: new Date(sortedVitaminD[0].date).toISOString() } : null;
    updatedPatient.lastThyroid = sortedThyroid[0] ? { tsh: sortedThyroid[0].tsh, date: new Date(sortedThyroid[0].date).toISOString() } : null;
    updatedPatient.lastBloodPressure = sortedBloodPressure[0] ? { systolic: sortedBloodPressure[0].systolic, diastolic: sortedBloodPressure[0].diastolic, heartRate: sortedBloodPressure[0].heartRate, date: new Date(sortedBloodPressure[0].date).toISOString() } : null;
    
    if (updatedPatient.height && sortedWeight.length > 0) {
        updatedPatient.bmi = calculateBmi(sortedWeight[0].value, updatedPatient.height);
    } else {
        updatedPatient.bmi = undefined;
    }

    let status: Patient['status'] = 'On Track';
    if (updatedPatient.lastHba1c && updatedPatient.lastHba1c.value >= 7.0) status = 'Urgent';
    else if (updatedPatient.lastBloodPressure && (updatedPatient.lastBloodPressure.systolic >= 140 || updatedPatient.lastBloodPressure.diastolic >= 90)) status = 'Urgent';
    else if (
        (updatedPatient.lastHba1c && updatedPatient.lastHba1c.value >= 5.7) ||
        (updatedPatient.lastLipid && updatedPatient.lastLipid.ldl >= 130) ||
        (updatedPatient.lastThyroid && (updatedPatient.lastThyroid.tsh < 0.4 || updatedPatient.lastThyroid.tsh > 4.0)) ||
        (updatedPatient.lastBloodPressure && (updatedPatient.lastBloodPressure.systolic >= 130 || updatedPatient.lastBloodPressure.diastolic >= 80))
    ) {
        status = 'Needs Review';
    }
    updatedPatient.status = status;

    return updatedPatient;
};

// Fetch all patients
export const getPatients = async (): Promise<Patient[]> => {
    const patientsCollection = collection(db, PATIENTS_COLLECTION);
    const patientsSnapshot = await getDocs(patientsCollection);
    const patientsList = patientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
    
    const processedPatients = patientsList.map(p => {
        const patientWithDefaults = {
            ...p,
            presentMedicalConditions: p.presentMedicalConditions || [],
            dashboardSuggestions: p.dashboardSuggestions || []
        };
        return recalculatePatientStatus(patientWithDefaults);
    });

    return processedPatients.sort((a, b) => {
        const dateA = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
        const dateB = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
        
        if (dateB !== dateA) {
            return dateB - dateA;
        }

        // If dates are the same (or both are null), sort by name
        return a.name.localeCompare(b.name);
    });
};

// Fetch a single patient
export const getPatient = async (id: string): Promise<Patient | null> => {
    const patientDocRef = doc(db, PATIENTS_COLLECTION, id);
    const patientDoc = await getDoc(patientDocRef);
    if (patientDoc.exists()) {
        const patientData = { id: patientDoc.id, ...patientDoc.data() } as Patient;
        return recalculatePatientStatus(patientData);
    }
    return null;
};

// Add a new patient
export const addPatient = async (patientData: Omit<Patient, 'id' | 'records' | 'lipidRecords' | 'vitaminDRecords' | 'thyroidRecords' | 'bloodPressureRecords' | 'weightRecords' | 'lastHba1c' | 'lastLipid' | 'lastVitaminD' | 'lastThyroid' | 'lastBloodPressure' | 'status' | 'medication' | 'presentMedicalConditions' | 'bmi' | 'height' | 'lastLogin'>): Promise<Patient> => {
    const countryInfo = countries.find(c => c.code === patientData.country);

    let newPatientObject: Omit<Patient, 'id'> = {
        ...patientData,
        dateFormat: countryInfo?.dateFormat || 'MM-dd-yyyy',
        unitSystem: countryInfo?.unitSystem || 'metric',
        lastHba1c: null,
        lastLipid: null,
        lastVitaminD: null,
        lastThyroid: null,
        lastBloodPressure: null,
        status: 'On Track',
        records: [] as Hba1cRecord[],
        lipidRecords: [] as LipidRecord[],
        vitaminDRecords: [] as VitaminDRecord[],
        thyroidRecords: [] as ThyroidRecord[],
        weightRecords: [] as WeightRecord[],
        bloodPressureRecords: [] as BloodPressureRecord[],
        medication: [] as Medication[],
        presentMedicalConditions: [] as MedicalCondition[],
    };
    
    let patientToSave = recalculatePatientStatus(newPatientObject as Patient);
    
    // Sanitize data to remove undefined values before sending to Firestore
    Object.keys(patientToSave).forEach(key => {
        if ((patientToSave as any)[key] === undefined) {
            delete (patientToSave as any)[key];
        }
    });

    const docRef = await addDoc(collection(db, PATIENTS_COLLECTION), patientToSave);
    return { ...patientToSave, id: docRef.id };
};

// Update an existing patient
export const updatePatient = async (patientId: string, patientData: Partial<Patient>): Promise<Patient> => {
    const patientDocRef = doc(db, PATIENTS_COLLECTION, patientId);
    
    const currentDocSnap = await getDoc(patientDocRef);
    if (!currentDocSnap.exists()) {
        throw new Error("Patient not found");
    }
    const currentData = currentDocSnap.data() as Patient;

    let updatedData: Patient = { ...currentData, ...patientData };
    
    const newWeight = (patientData as any).weight;
    if (newWeight) {
        const newWeightRecord = {
            id: `weight-${Date.now()}`,
            date: new Date().toISOString(),
            value: Number(Number(newWeight).toFixed(2)),
        };
        updatedData.weightRecords = [...(updatedData.weightRecords || []), newWeightRecord];
        delete (updatedData as any).weight;
    }
    
    updatedData = recalculatePatientStatus(updatedData);

    // Sanitize data to remove undefined values before sending to Firestore
    Object.keys(updatedData).forEach(key => {
        if ((updatedData as any)[key] === undefined) {
            delete (updatedData as any)[key];
        }
    });

    await setDoc(patientDocRef, updatedData, { merge: true });
    return updatedData;
};


// Delete a patient
export const deletePatient = async (id: string): Promise<void> => {
    const patientDocRef = doc(db, PATIENTS_COLLECTION, id);
    await deleteDoc(patientDocRef);
};
