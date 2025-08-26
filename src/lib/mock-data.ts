
import type { Patient } from './types';

export const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Dr. Alexandria von Schmidt-Brauenstein',
    dob: '1980-01-15',
    gender: 'female',
    email: 'alexandria.schmidt.brauenstein@verylongdomainname.co.uk',
    country: 'GB',
    phone: '+442079460958',
    lastHba1c: { value: 5.8, date: '2024-05-15' },
    lastLipid: { ldl: 110, date: '2024-03-20' },
    lastVitaminD: { value: 25, date: '2024-01-10' },
    status: 'Needs Review',
    vitaminDRecords: [
        { id: 'vd1', date: '2024-01-10', value: 25 },
    ]
  },
  {
    id: '2',
    name: 'John Smith',
    dob: '1975-08-22',
    gender: 'male',
    email: 'john.smith@example.com',
    country: 'US',
    phone: '+19876543210',
    lastHba1c: { value: 7.2, date: '2024-06-01' },
    lastLipid: null,
    lastVitaminD: { value: 18, date: '2023-12-01' },
    status: 'Urgent',
    vitaminDRecords: [
        { id: 'vd2', date: '2023-12-01', value: 18 },
    ]
  },
  {
    id: '3',
    name: 'Emily White',
    dob: '1992-11-30',
    gender: 'female',
    email: 'emily.white@example.com',
    country: 'CA',
    phone: '+16475551234',
    lastHba1c: { value: 5.4, date: '2024-04-10' },
    lastLipid: { ldl: 95, date: '2024-04-10' },
    lastVitaminD: { value: 45, date: '2024-02-20' },
    status: 'On Track',
    vitaminDRecords: [
      { id: 'vd3', date: '2024-02-20', value: 45 },
    ]
  },
   {
    id: '4',
    name: 'Michael Brown',
    dob: '1968-03-12',
    gender: 'male',
    email: 'michael.brown@example.com',
    country: 'AU',
    phone: '+61491570110',
    lastHba1c: null,
    lastLipid: { ldl: 130, date: '2024-01-12' },
    lastVitaminD: null,
    status: 'Needs Review',
  },
  {
    id: '5',
    name: 'Maria Garcia',
    dob: '1985-07-19',
    gender: 'female',
    email: 'maria.garcia@example.com',
    country: 'IN',
    phone: '+919876543210',
    lastHba1c: { value: 6.1, date: '2024-05-20' },
    lastLipid: { ldl: 145, date: '2024-05-20' },
    lastVitaminD: { value: 32, date: '2024-03-01' },
    status: 'Needs Review',
    vitaminDRecords: [
       { id: 'vd4', date: '2024-03-01', value: 32 },
    ]
  },
];
