

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
  userInput?: string;
  icdCode?: string;
  synopsis?: string;
  status: 'verified' | 'pending_review' | 'needs_revision';
}

export type FoodInstruction = 'before' | 'after' | 'with';

export interface Medication {
  id: string;
  name: string;
  brandName: string;
  dosage: string;
  frequency: string;
  foodInstructions?: FoodInstruction;
}

export interface WeightRecord {
  id:string;
  date: Date | string;
  value: number; // in kg
  medication?: string;
}

export interface DashboardSuggestion {
  id: string;
  basedOnCondition: string;
  panelName: string;
  isNewPanel: boolean;
  biomarkers: string[];
  status: 'pending' | 'dismissed' | 'completed';
}

export interface PendingBiomarker {
    name: string;
    key: string;
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
  enabledBiomarkers?: { [key: string]: string[] };
  doctorUid?: string;
  doctorName?: string;
  doctorEmail?: string;
  doctorPhone?: string;
  dashboardSuggestions?: DashboardSuggestion[];
  pendingBiomarkers?: PendingBiomarker[];
}

export interface Hba1cRecord {
    id: string;
    date: Date | string;
    value: number; // as percentage
    medication?: string;
}

export interface FastingBloodGlucoseRecord {
  id: string;
  date: Date | string;
  value: number; // in mg/dL
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

export interface ThyroxineRecord {
  id: string;
  date: Date | string;
  value: number; // in ng/dL
  medication?: string;
}

export interface SerumCreatinineRecord {
  id: string;
  date: Date | string;
  value: number; // in mg/dL
  medication?: string;
}

export interface UricAcidRecord {
  id: string;
  date: Date | string;
  value: number; // in mg/dL
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

export interface HemoglobinRecord {
  id: string;
  date: Date | string;
  hemoglobin: number; // in g/dL
  medication?: string;
}

export interface TotalCholesterolRecord {
  id: string;
  date: Date | string;
  value: number; // in mg/dL
  medication?: string;
}

export interface LdlRecord {
  id: string;
  date: Date | string;
  value: number; // in mg/dL
  medication?: string;
}

export interface HdlRecord {
  id: string;
  date: Date | string;
  value: number; // in mg/dL
  medication?: string;
}

export interface TriglyceridesRecord {
  id: string;
  date: Date | string;
  value: number; // in mg/dL
  medication?: string;
}

export type LipidRecord = TotalCholesterolRecord & { ldl: number; hdl: number; triglycerides: number; };

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
  lastHba1c?: {
      value: number;
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
  lastHemoglobin?: {
    value: number;
    date: string;
  } | null;
  lastFastingBloodGlucose?: {
      value: number;
      date: string;
  } | null;
  status: 'On Track' | 'Needs Review' | 'Urgent';
  // Add full record history to the patient object
  hba1cRecords: Hba1cRecord[];
  fastingBloodGlucoseRecords: FastingBloodGlucoseRecord[];
  vitaminDRecords: VitaminDRecord[];
  thyroidRecords: ThyroidRecord[];
  thyroxineRecords: ThyroxineRecord[];
  serumCreatinineRecords: SerumCreatinineRecord[];
  uricAcidRecords?: UricAcidRecord[];
  hemoglobinRecords: HemoglobinRecord[];
  weightRecords: WeightRecord[];
  bloodPressureRecords: BloodPressureRecord[];
  totalCholesterolRecords: TotalCholesterolRecord[];
  ldlRecords: LdlRecord[];
  hdlRecords: HdlRecord[];
  triglyceridesRecords: TriglyceridesRecord[];
  medication: Medication[];
  presentMedicalConditions: MedicalCondition[];
  enabledBiomarkers: { [key: string]: string[] };
  doctorUid: string;
  doctorName?: string;
  doctorEmail?: string;
  doctorPhone?: string;
  dashboardSuggestions?: DashboardSuggestion[];
  pendingBiomarkers?: PendingBiomarker[];
}

export type BiomarkerKey = 
  | 'hba1c' 
  | 'glucose' 
  | 'hemoglobin' 
  | 'bloodPressure' 
  | 'thyroid'
  | 'thyroxine'
  | 'vitaminD' 
  | 'weight' 
  | 'totalCholesterol' 
  | 'ldl' 
  | 'hdl' 
  | 'triglycerides'
  | 'serumCreatinine'
  | 'uricAcid';

export type DiseasePanelKey = 'diabetes' | 'hypertension' | 'lipidPanel';
