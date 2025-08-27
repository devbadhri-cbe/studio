
'use client';

import { db } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, setDoc, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import type { Patient, Hba1cRecord, LipidRecord, VitaminDRecord, ThyroidRecord, BloodPressureRecord, WeightRecord } from './types';
import { calculateBmi } from './utils';

const PATIENTS_COLLECTION = 'patients';

// Helper function to recalculate patient status and latest readings
const recalculatePatientStatus = (patient: Patient): Patient => {
    const updatedPatient = { ...patient };
    
    // Sort records to find the latest
    const sortedHba1c = [...(updatedPatient.records || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const sortedLipids = [...(updatedPatient.lipidRecords || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const sortedVitaminD = [...(updatedPatient.vitaminDRecords || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const sortedThyroid = [...(updatedPatient.thyroidRecords || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const sortedBloodPressure = [...(updatedPatient.bloodPressureRecords || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const sortedWeight = [...(updatedPatient.weightRecords || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Update latest readings
    updatedPatient.lastHba1c = sortedHba1c[0] ? { value: sortedHba1c[0].value, date: new Date(sortedHba1c[0].date).toISOString() } : null;
    updatedPatient.lastLipid = sortedLipids[0] ? { ldl: sortedLipids[0].ldl, date: new Date(sortedLipids[0].date).toISOString() } : null;
    updatedPatient.lastVitaminD = sortedVitaminD[0] ? { value: sortedVitaminD[0].value, date: new Date(sortedVitaminD[0].date).toISOString() } : null;
    updatedPatient.lastThyroid = sortedThyroid[0] ? { tsh: sortedThyroid[0].tsh, date: new Date(sortedThyroid[0].date).toISOString() } : null;
    updatedPatient.lastBloodPressure = sortedBloodPressure[0] ? { systolic: sortedBloodPressure[0].systolic, diastolic: sortedBloodPressure[0].diastolic, date: new Date(sortedBloodPressure[0].date).toISOString() } : null;
    
    // Update BMI
    if (updatedPatient.height && sortedWeight.length > 0) {
        updatedPatient.bmi = calculateBmi(sortedWeight[0].value, updatedPatient.height);
    } else {
        updatedPatient.bmi = undefined;
    }

    // Recalculate Status
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
    const q = query(collection(db, PATIENTS_COLLECTION), orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
};

// Fetch a single patient
export const getPatient = async (id: string): Promise<Patient | null> => {
    const docRef = doc(db, PATIENTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Patient;
    } else {
        return null;
    }
};

// Add a new patient
export const addPatient = async (patientData: Omit<Patient, 'id'>): Promise<Patient> => {
    const newPatient: Omit<Patient, 'id'> = {
        ...patientData,
        lastHba1c: null,
        lastLipid: null,
        lastVitaminD: null,
        lastThyroid: null,
        lastBloodPressure: null,
        status: 'On Track',
        records: [],
        lipidRecords: [],
        vitaminDRecords: [],
        thyroidRecords: [],
        weightRecords: patientData.weightRecords || [],
        bloodPressureRecords: [],
        medication: [],
        presentMedicalConditions: [],
    };
    
    const patientWithStatus = recalculatePatientStatus(newPatient as Patient);

    const docRef = await addDoc(collection(db, PATIENTS_COLLECTION), patientWithStatus);
    return { id: docRef.id, ...patientWithStatus };
};

// Update an existing patient
export const updatePatient = async (patientId: string, patientData: Partial<Omit<Patient, 'id'>>, existingPatient?: Patient): Promise<Patient> => {
    const docRef = doc(db, PATIENTS_COLLECTION, patientId);
    
    // If we have the full patient object, we can recalculate status
    if (existingPatient) {
        let updatedData = { ...existingPatient, ...patientData };
        updatedData = recalculatePatientStatus(updatedData);
        await setDoc(docRef, updatedData);
        return updatedData;
    } else {
        // Otherwise, just update the provided fields
        await updateDoc(docRef, patientData);
        const updatedDoc = await getDoc(docRef);
        const finalPatient = { id: updatedDoc.id, ...updatedDoc.data() } as Patient;
        // Recalculate status after fetching the full document
        const patientWithStatus = recalculatePatientStatus(finalPatient);
        if(JSON.stringify(patientWithStatus) !== JSON.stringify(finalPatient)) {
            await setDoc(docRef, patientWithStatus);
        }
        return patientWithStatus;
    }
};


// Delete a patient
export const deletePatient = async (id: string): Promise<void> => {
    const docRef = doc(db, PATIENTS_COLLECTION, id);
    await deleteDoc(docRef);
};
