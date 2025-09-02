

import { Timestamp } from "firebase/firestore";

export type UnitSystem = 'metric' | 'imperial';

// The Doctor type is not used in the single-doctor model, but kept for future reference.
export interface Doctor {
  uid: string;
  name: string;
  email: string;
}

export interface MedicalCondition {
  id: string;
  date: string; // Stored as 'YYYY-MM-DD' string
  condition: string;
  icdCode?: string;
  status: 'verified' | 'pending_review' | 'needs_revision';
  requiredBiomarkers?: string[];
}

export interface DashboardSuggestion {
  id: string;
  conditionId: string;
  conditionName: string;
  suggestedDashboard: string;
  status: 'pending' | 'acknowledged';
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
}

export interface WeightRecord {
  id: string;
  date: Date | string;
  value: number; // in kg
  medication?: string;
}

export interface UserProfile {
  id: string; // Add patient ID to profile for easier lookup
  name: string;
  dob: string; // Stored as 'YYYY-MM-DD' string
  gender: 'male' | 'female' | 'other';
  email?: string;
  country: string;
  phone?: string;
  height?: number; // in cm
  dateFormat: string; // e.g., 'dd-MM-yyyy'
  unitSystem: UnitSystem;
  presentMedicalConditions: MedicalCondition[];
  medication: Medication[];
  bmi?: number;
  enabledDashboards?: string[];
  doctorName?: string;
}

export interface FastingBloodGlucoseRecord {
  id: string;
  date: Date | string;
  value: number; // in mg/dL
  medication?: string;
}

export interface LipidRecord {
  id:string;
  date: Date | string;
  ldl: number;
  hdl: number;
  triglycerides: number;
  total: number;
  medication?: string;
}

export interface VitaminDRecord {
  id: string;
  date: Date | string;
  value: number; // in ng/mL
  medication?: string;
}

export interface ThyroidRecord {
  id: string;
  date: Date | string;
  tsh: number;
  t3: number;
  t4: number;
  medication?: string;
}

export interface BloodPressureRecord {
  id: string;
  date: Date | string;
  systolic: number;
  diastolic: number;
  heartRate?: number;
  medication?: string;
}

export interface RenalRecord {
  id: string;
  date: Date | string;
  serumCreatinine: number;
  serumCreatinineUnits: 'mg/dL' | 'umol/L';
  bun?: number; // Blood Urea Nitrogen
  uacr: number; // Urine Albumin-to-Creatinine Ratio
  medication?: string;
  eGFR?: number; // Optional: to store the calculated value
}

export interface ElectrolyteRecord {
    id: string;
    date: Date | string;
    sodium: number;
    potassium: number;
    chloride: number;
    bicarbonate: number;
    medication?: string;
}

export interface MineralBoneDiseaseRecord {
  id: string;
  date: Date | string;
  calcium: number;
  phosphorus: number;
  pth: number; // Parathyroid Hormone
  medication?: string;
}

export interface AnemiaRecord {
  id: string;
  date: Date | string;
  hemoglobin: number; // in g/dL
  medication?: string;
}

export interface NutritionRecord {
  id: string;
  date: Date | string;
  albumin: number; // in g/dL
  medication?: string;
}


export interface Patient {
  id: string;
  name: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  email: string;
  country: string;
  phone: string;
  height?: number; // in cm
  dateFormat: string;
  unitSystem: UnitSystem;
  lastLogin?: string; // ISO string
  bmi?: number;
  lastLipid: {
    ldl: number;
    date: string;
  } | null;
  lastVitaminD?: {
    value: number;
    date: string;
  } | null;
  lastThyroid?: {
    tsh: number;
    date: string;
  } | null;
  lastBloodPressure?: {
    systolic: number;
    diastolic: number;
    heartRate?: number;
    date: string;
  } | null;
  lastRenal?: {
    eGFR: number;
    uacr: number;
    date: string;
  } | null;
  lastHemoglobin?: {
    value: number;
    date: string;
  } | null;
  lastAlbumin?: {
      value: number;
      date: string;
  } | null;
  status: 'On Track' | 'Needs Review' | 'Urgent';
  // Add full record history to the patient object
  fastingBloodGlucoseRecords: FastingBloodGlucoseRecord[];
  lipidRecords: LipidRecord[];
  vitaminDRecords: VitaminDRecord[];
  thyroidRecords: ThyroidRecord[];
  renalRecords: RenalRecord[];
  electrolyteRecords: ElectrolyteRecord[];
  mineralBoneDiseaseRecords: MineralBoneDiseaseRecord[];
  anemiaRecords: AnemiaRecord[];
  nutritionRecords: NutritionRecord[];
  weightRecords: WeightRecord[];
  bloodPressureRecords: BloodPressureRecord[];
  medication: Medication[];
  presentMedicalConditions: MedicalCondition[];
  dashboardSuggestions: DashboardSuggestion[];
  enabledDashboards: string[];
  doctorName?: string;
}
