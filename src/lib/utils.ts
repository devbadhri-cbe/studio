
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInYears } from "date-fns"
 
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
    return parseFloat(bmi.toFixed(1));
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
    const inches = Math.round(totalInches % 12);
    return { feet, inches };
};
