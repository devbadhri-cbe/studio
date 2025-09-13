export type UnitSystem = 'metric' | 'imperial';

export interface MedicalCondition {
  id: string;
  date: string; 
  condition: string; // This will be the standardized name
  userInput: string; // What the user originally typed
  icdCode?: string;
  synopsis?: string;
  status: 'processed' | 'pending_review' | 'failed';
}

export type FoodInstruction = 'before' | 'after' | 'with';

export interface Medication {
  id: string;
  name: string; // The active ingredient
  userInput: string; // The original text the user entered
  dosage: string;
  frequency: string;
  foodInstructions?: FoodInstruction;
  status: 'processed' | 'pending_review' | 'failed';
  [key: string]: any; // Allow for extra properties from AI like spellingSuggestion
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

export interface FastingBloodGlucoseRecord {
    id: string;
    date: string;
    value: number; // in mg/dL
}

export interface BloodPressureRecord {
    id: string;
    date: string;
    systolic: number;
    diastolic: number;
    heartRate?: number;
}

export interface ThyroidRecord {
    id: string;
    date: string;
    tsh: number;
    t3: number;
    t4: number;
}

export interface HemoglobinRecord {
    id: string;
    date: string;
    hemoglobin: number;
}


export interface ThyroxineRecord {
    id: string;
    date: string;
    value: number;
}

export interface SerumCreatinineRecord {
    id: string;
    date: string;
    value: number;
}

export interface UricAcidRecord {
    id: string;
    date: string;
    value: number;
}

export interface TotalCholesterolRecord {
    id: string;
    date: string;
    value: number;
}
export interface LdlRecord {
    id: string;
    date: string;
    value: number;
}
export interface HdlRecord {
    id: string;
    date: string;
    value: number;
}
export interface TriglyceridesRecord {
    id: string;
    date: string;
    value: number;
}

export type BiomarkerKey = 
  | 'hba1c'
  | 'glucose'
  | 'hemoglobin'
  | 'bloodPressure'
  | 'thyroid'
  | 'thyroxine'
  | 'weight'
  | 'totalCholesterol'
  | 'ldl'
  | 'hdl'
  | 'triglycerides'
  | 'serumCreatinine'
  | 'uricAcid';

export interface DiseasePanelState {
    diabetes: {
        hba1c: boolean;
        glucose: boolean;
    };
    hypertension: {
        bloodPressure: boolean;
        hemoglobin: boolean;
    };
    lipidPanel: {
        total: boolean;
        ldl: boolean;
        hdl: boolean;
        triglycerides: boolean;
    };
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
  bmi?: number;
  dateFormat: string;
  unitSystem: UnitSystem;
  status: 'On Track' | 'Needs Review' | 'Urgent';
  lastLogin?: string | null;

  hba1cRecords: Hba1cRecord[];
  medication: Medication[];
  presentMedicalConditions: MedicalCondition[];
  fastingBloodGlucoseRecords: FastingBloodGlucoseRecord[];
  weightRecords: WeightRecord[];
  bloodPressureRecords: BloodPressureRecord[];
  thyroidRecords: ThyroidRecord[];
  thyroxineRecords: ThyroxineRecord[];
  serumCreatinineRecords: SerumCreatinineRecord[];
  uricAcidRecords: UricAcidRecord[];
  hemoglobinRecords: HemoglobinRecord[];
  totalCholesterolRecords: TotalCholesterolRecord[];
  ldlRecords: LdlRecord[];
  hdlRecords: HdlRecord[];
  triglyceridesRecords: TriglyceridesRecord[];

  // Summary fields for quick access
  lastHba1c?: { value: number; date: string } | null;
  lastFastingBloodGlucose?: { value: number; date: string } | null;
  lastBloodPressure?: { systolic: number; diastolic: number; date: string } | null;
  
  // AI and UI settings
  dashboardSuggestions?: string[];
  diseasePanels?: DiseasePanelState;

  // Doctor-related fields
  doctorUid?: string;
  doctorName?: string;
  doctorEmail?: string;
  doctorPhone?: string;
}
