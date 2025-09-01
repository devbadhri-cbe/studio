

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInYears } from "date-fns"
import { countries } from "./countries";
 
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

/**
 * Calculates eGFR using the CKD-EPI 2021 equation.
 * @param creatinine Serum creatinine value.
 * @param unit Unit of the creatinine value ('mg/dL' or 'umol/L').
 * @param age Patient's age in years.
 * @param gender Patient's gender ('male' or 'female').
 * @returns The calculated eGFR value.
 */
export function calculateEgfr(creatinine: number, unit: 'mg/dL' | 'umol/L', age: number, gender: 'male' | 'female'): number {
    if (gender === 'other') return 0; // Or handle as per clinical guidelines for 'other'

    // Convert creatinine to mg/dL if it's in µmol/L
    const scr = unit === 'umol/L' ? creatinine / 88.4 : creatinine;

    const k = gender === 'female' ? 0.7 : 0.9;
    const alpha = gender === 'female' ? -0.241 : -0.302;
    const sexFactor = gender === 'female' ? 1.012 : 1;

    const minTerm = Math.min(scr / k, 1);
    const maxTerm = Math.max(scr / k, 1);

    const egfr = 142 * Math.pow(minTerm, alpha) * Math.pow(maxTerm, -1.200) * Math.pow(0.9938, age) * sexFactor;

    return Math.round(egfr);
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
