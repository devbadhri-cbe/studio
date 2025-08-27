

'use client';

import { db } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, setDoc, deleteDoc, query } from 'firebase/firestore';
import type { Patient } from './types';
import { calculateBmi } from './utils';
import { MOCK_PATIENTS } from './mock-data';
import { Hba1cRecord } from './types';
import { LipidRecord } from './types';
import { VitaminDRecord } from './types';
import { ThyroidRecord } from './types';
import { WeightRecord } from './types';
import { BloodPressureRecord } from './types';
import { MedicalCondition } from './types';
import { Medication } from './types';

let patientsStore: Patient[] = [...MOCK_PATIENTS];

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
    updatedPatient.lastBloodPressure = sortedBloodPressure[0] ? { systolic: sortedBloodPressure[0].systolic, diastolic: sortedBloodPressure[0].diastolic, date: new Date(sortedBloodPressure[0].date).toISOString() } : null;
    
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
    console.log("Using mock data: getPatients");
    return Promise.resolve(patientsStore.sort((a, b) => a.name.localeCompare(b.name)));
};

// Fetch a single patient
export const getPatient = async (id: string): Promise<Patient | null> => {
    console.log(`Using mock data: getPatient for id ${id}`);
    const patient = patientsStore.find(p => p.id === id) || null;
    return Promise.resolve(patient);
};

// Add a new patient
export const addPatient = async (patientData: Omit<Patient, 'id' | 'records' | 'lipidRecords' | 'vitaminDRecords' | 'thyroidRecords' | 'bloodPressureRecords' | 'weightRecords' | 'lastHba1c' | 'lastLipid' | 'lastVitaminD' | 'lastThyroid' | 'lastBloodPressure' | 'status' | 'medication' | 'presentMedicalConditions' | 'bmi'> & { weight?: number }): Promise<Patient> => {
    console.log("Using mock data: addPatient");
    const { weight, ...restOfPatientData } = patientData;

    let newPatientObject: Patient = {
        id: Date.now().toString(),
        ...restOfPatientData,
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

    if (weight) {
        newPatientObject.weightRecords = [{
            id: `weight-${Date.now()}`,
            date: new Date().toISOString(),
            value: weight,
        }];
    }
    
    let patientToSave = recalculatePatientStatus(newPatientObject);
    
    patientsStore.push(patientToSave);
    return Promise.resolve(patientToSave);
};

// Update an existing patient
export const updatePatient = async (patientId: string, patientData: Partial<Patient>): Promise<Patient> => {
    console.log(`Using mock data: updatePatient for id ${patientId}`);
    let existingPatient = patientsStore.find(p => p.id === patientId);
    if (!existingPatient) {
        throw new Error("Patient not found in mock data");
    }

    let updatedData: Patient = { ...existingPatient, ...patientData };

    const newWeight = (patientData as any).weight;
    if (newWeight) {
        const newWeightRecord = {
            id: `weight-${Date.now()}`,
            date: new Date().toISOString(),
            value: newWeight,
        };
        updatedData.weightRecords = [...(updatedData.weightRecords || []), newWeightRecord];
        delete (updatedData as any).weight;
    }
    
    updatedData = recalculatePatientStatus(updatedData);
    
    patientsStore = patientsStore.map(p => p.id === patientId ? updatedData : p);
    return Promise.resolve(updatedData);
};


// Delete a patient
export const deletePatient = async (id: string): Promise<void> => {
    console.log(`Using mock data: deletePatient for id ${id}`);
    patientsStore = patientsStore.filter(p => p.id !== id);
    return Promise.resolve();
};
