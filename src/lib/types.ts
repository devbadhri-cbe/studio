export interface MedicalCondition {
  id: string;
  date: string; // Stored as 'YYYY-MM-DD' string
  condition: string;
  icdCode?: string;
}

export interface UserProfile {
  name: string;
  dob: string; // Stored as 'YYYY-MM-DD' string
  presentMedicalConditions: MedicalCondition[];
  medication: string;
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
