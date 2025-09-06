

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInYears } from "date-fns"
import { countries } from "./countries";
import type { Patient } from "./types";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateAge(dob: string): number | null {
  if (!dob) return null;
  try {
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) {
      return null;
    }
    return differenceInYears(new Date(), birthDate);
  } catch (e) {
    console.error("Could not calculate age", e);
    return null;
  }
}

export function calculateBmi(weight: number | undefined, height: number | undefined): number | null {
  if (!weight || !height || height === 0) return null;
  try {
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return parseFloat(bmi.toFixed(2));
  } catch (e) {
    console.error("Could not calculate BMI", e);
    return null;
  }
}

export const BMI_CATEGORIES: { min: number, max: number, text: string, variant: 'destructive' | 'secondary' | 'outline' | 'default' }[] = [
    { min: 0, max: 18.4, text: 'Underweight', variant: 'secondary' },
    { min: 18.5, max: 24.9, text: 'Normal weight', variant: 'outline' },
    { min: 25, max: 29.9, text: 'Overweight', variant: 'secondary' },
    { min: 30, max: 34.9, text: 'Obese Class I', variant: 'destructive' },
    { min: 35, max: 39.9, text: 'Obese Class II', variant: 'destructive' },
    { min: 40, max: Infinity, text: 'Morbidly Obese', variant: 'destructive' },
];

export function getBmiStatus(bmi: number | null | undefined): { text: string; variant: 'destructive' | 'secondary' | 'outline' | 'default' } | null {
  if (bmi === null || bmi === undefined) return null;

  const category = BMI_CATEGORIES.find(c => bmi >= c.min && bmi <= c.max);

  return category || null;
}

export const lbsToKg = (lbs: number) => lbs * 0.453592;
export const kgToLbs = (kg: number) => kg / 0.453592;
export const ftInToCm = (ft: number, inches: number) => (ft * 12 + inches) * 2.54;
export const cmToFtIn = (cm: number) => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = parseFloat((totalInches % 12).toFixed(1));
    return { feet, inches };
};

export const formatDisplayPhoneNumber = (phone?: string, countryCode?: string): string => {
    if (!phone || !countryCode) return phone || 'N/A';
    const country = countries.find(c => c.code === countryCode);
    if (!country) return phone;
    
    const phoneDigits = phone.replace(/\D/g, '');
    const countryPhoneCodeDigits = country.phoneCode.replace(/\D/g, '');
    
    const nationalNumber = phoneDigits.startsWith(countryPhoneCodeDigits)
        ? phoneDigits.substring(countryPhoneCodeDigits.length)
        : phoneDigits;

    switch (countryCode) {
        case 'US':
        case 'CA':
            if (nationalNumber.length === 10) {
                return `${country.phoneCode} (${nationalNumber.substring(0, 3)}) ${nationalNumber.substring(3, 6)}-${nationalNumber.substring(6)}`;
            }
            break;
        case 'IN':
             if (nationalNumber.length === 10) {
                return `${country.phoneCode} ${nationalNumber.substring(0, 5)} ${nationalNumber.substring(5)}`;
            }
            break;
        case 'GB':
             if (nationalNumber.length === 10) {
                return `${country.phoneCode} ${nationalNumber.substring(0, 4)} ${nationalNumber.substring(4)}`;
            }
            break;
        default:
            return `${country.phoneCode} ${nationalNumber}`;
    }
    
    return `${country.phoneCode} ${nationalNumber}`;
}

const getPatientStatus = (patientData: Partial<Patient>): 'On Track' | 'Needs Review' | 'Urgent' => {
  const lastBP = patientData.bloodPressureRecords && patientData.bloodPressureRecords.length > 0 
    ? [...patientData.bloodPressureRecords].sort((a,b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())[0] 
    : null;
    
  const needsReview = patientData.presentMedicalConditions?.some(c => c.status === 'pending_review');

  if (lastBP && (lastBP.systolic >= 140 || lastBP.diastolic >= 90)) return 'Urgent';
  if (needsReview) return 'Needs Review';
  
  return 'On Track';
};


export const processPatientData = (data: any): Patient => {
  const hba1cRecords = data.hba1cRecords || [];
  const fastingBloodGlucoseRecords = data.fastingBloodGlucoseRecords || [];
  const vitaminDRecords = data.vitaminDRecords || [];
  const thyroidRecords = data.thyroidRecords || [];
  const weightRecords = data.weightRecords || [];
  const bloodPressureRecords = data.bloodPressureRecords || [];
  const hemoglobinRecords = data.hemoglobinRecords || [];
  const totalCholesterolRecords = data.totalCholesterolRecords || [];
  const ldlRecords = data.ldlRecords || [];
  const hdlRecords = data.hdlRecords || [];
  const triglyceridesRecords = data.triglyceridesRecords || [];
  const presentMedicalConditions = data.presentMedicalConditions || [];

  const lastHba1c = hba1cRecords.length > 0 ? [...hba1cRecords].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;
  const lastVitaminD = vitaminDRecords.length > 0 ? [...vitaminDRecords].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;
  const lastThyroid = thyroidRecords.length > 0 ? [...thyroidRecords].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;
  const lastBloodPressure = bloodPressureRecords.length > 0 ? [...bloodPressureRecords].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;
  const lastHemoglobin = hemoglobinRecords.length > 0 ? [...hemoglobinRecords].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;

  const latestWeight = weightRecords.length > 0 ? [...weightRecords].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;
  const bmi = (latestWeight && data.height) ? calculateBmi(latestWeight?.value, data.height) : null;
  
  const patientData: Partial<Patient> = {
    ...data,
    hba1cRecords,
    fastingBloodGlucoseRecords,
    vitaminDRecords,
    thyroidRecords,
    weightRecords,
    bloodPressureRecords,
    presentMedicalConditions,
    hemoglobinRecords,
    totalCholesterolRecords,
    ldlRecords,
    hdlRecords,
    triglyceridesRecords,
    bmi,
  };

  const status = getPatientStatus(patientData);
  
  return {
    ...patientData,
    status,
    lastHba1c: lastHba1c ? { value: lastHba1c.value, date: lastHba1c.date } : null,
    lastVitaminD: lastVitaminD ? { value: lastVitaminD.value, date: lastVitaminD.date } : null,
    lastThyroid: lastThyroid ? { tsh: lastThyroid.tsh, date: lastThyroid.date } : null,
    lastBloodPressure: lastBloodPressure ? { systolic: lastBloodPressure.systolic, diastolic: lastBloodPressure.diastolic, date: lastBloodPressure.date } : null,
    lastHemoglobin: lastHemoglobin ? { value: lastHemoglobin.hemoglobin, date: lastHemoglobin.date } : null,
  } as Patient;
};
