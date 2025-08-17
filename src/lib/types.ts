export interface UserProfile {
  name: string;
  dob: string; // Stored as 'YYYY-MM-DD' string
  medication: string;
}

export interface Hba1cRecord {
  id: string;
  date: Date | string;
  value: number; // in %
  medication?: string;
}
