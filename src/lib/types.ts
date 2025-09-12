export type UnitSystem = 'metric' | 'imperial';

export interface MedicalCondition {
  id: string;
  date: string; 
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
  date: string;
  value: number; // in kg
}

export interface Hba1cRecord {
    id: string;
    date: string;
    value: number; // as percentage
}

export interface Patient {
  id: string;
  name: string;
  dob: string;
  gender: 'male' | 'female';
  email: string;
  country: string;
  phone: string;
  height?: number; // in cm
  dateFormat: string;
  unitSystem: UnitSystem;
  status: 'On Track' | 'Needs Review' | 'Urgent';
  hba1cRecords: Hba1cRecord[];
  medication: Medication[];
}

export type BiomarkerKey = 
  | 'hba1c';

export type DiseasePanelKey = 'diabetes' | 'hypertension' | 'lipidPanel';
