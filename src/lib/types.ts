

export type Theme = 'light' | 'dark' | 'system';

export interface MedicalCondition {
  id: string;
  date: string; // Stored as 'YYYY-MM-DD' string
  condition: string;
  icdCode?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
}

export interface UserProfile {
  id: string; // Add patient ID to profile for easier lookup
  name: string;
  dob: string; // Stored as 'YYYY-MM-DD' string
  gender: 'male' | 'female' | 'other';
  email?: string;
  country: string;
  phone?: string;
  presentMedicalConditions: MedicalCondition[];
  medication: Medication[];
  vitaminDRecords?: VitaminDRecord[];
}

export interface Hba1cRecord {
  id: string;
  date: Date | string;
  value: number; // in %
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

export interface Patient {
  id: string;
  name: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  email: string;
  country: string;
  phone: string;
  lastHba1c: {
    value: number;
    date: string;
  } | null;
  lastLipid: {
    ldl: number;
    date: string;
  } | null;
  lastVitaminD?: {
    value: number;
    date: string;
  } | null;
  status: 'On Track' | 'Needs Review' | 'Urgent';
  // Add full record history to the patient object
  records?: Hba1cRecord[];
  lipidRecords?: LipidRecord[];
  vitaminDRecords?: VitaminDRecord[];
  medication?: Medication[];
  presentMedicalConditions?: MedicalCondition[];
}

    
