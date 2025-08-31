
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
