
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

export function calculateBmi(weight?: number, height?: number): number | undefined {
  if (!weight || !height || height === 0) return undefined;
  try {
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return parseFloat(bmi.toFixed(2));
  } catch (e) {
    console.error("Could not calculate BMI", e);
    return undefined;
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
    if (!phone) return 'N/A';
    if (!countryCode) return phone;
    
    const country = countries.find(c => c.code === countryCode);
    if (!country) return phone;
    
    const phoneDigits = phone.replace(/\D/g, '');
    const countryPhoneCodeDigits = country.phoneCode.replace(/\D/g, '');
    
    let nationalNumber = phoneDigits;
    if (phoneDigits.startsWith(countryPhoneCodeDigits)) {
        nationalNumber = phoneDigits.substring(countryPhoneCodeDigits.length);
    }
    
    // Fallback for empty national number
    if (!nationalNumber) {
        return country.phoneCode;
    }

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
                return `${country.phoneCode} 0${nationalNumber.substring(0, 4)} ${nationalNumber.substring(4)}`;
            }
            break;
        default:
            // Generic formatting for other countries
            return `${country.phoneCode} ${nationalNumber}`;
    }
    
    // Return formatted with country code if no specific format matched
    return `${country.phoneCode} ${nationalNumber}`;
}
