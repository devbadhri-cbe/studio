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

export interface FastingBloodGlucoseRecord {
  id: string;
  date: string;
  value: number; // in mg/dL
}

export interface ThyroidRecord {
  id: string;
  date: string;
  tsh: number;
  t3: number;
  t4: number;
}

export interface ThyroxineRecord {
  id: string;
  date: string;
  value: number; // in ng/dL
}

export interface SerumCreatinineRecord {
  id: string;
  date: string;
  value: number; // in mg/dL
}

export interface UricAcidRecord {
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

export interface HemoglobinRecord {
  id: string;
  date: string;
  hemoglobin: number; // in g/dL
}

export interface TotalCholesterolRecord {
  id: string;
  date: string;
  value: number; // in mg/dL
}

export interface LdlRecord {
  id: string;
  date: string;
  value: number; // in mg/dL
}

export interface HdlRecord {
  id: string;
  date: string;
  value: number; // in mg/dL
}

export interface TriglyceridesRecord {
  id: string;
  date: string;
  value: number; // in mg/dL
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
  lastLogin?: string; // ISO string
  bmi?: number;
  status: 'On Track' | 'Needs Review' | 'Urgent';
  hba1cRecords: Hba1cRecord[];
  fastingBloodGlucoseRecords: FastingBloodGlucoseRecord[];
  thyroidRecords: ThyroidRecord[];
  thyroxineRecords: ThyroxineRecord[];
  serumCreatinineRecords: SerumCreatinineRecord[];
  uricAcidRecords: UricAcidRecord[];
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

export type DiseasePanelKey = 'diabetes' | 'hypertension' | 'lipidPanel';
