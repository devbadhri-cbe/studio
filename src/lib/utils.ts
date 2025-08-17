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
