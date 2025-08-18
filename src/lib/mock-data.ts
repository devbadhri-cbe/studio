
import type { Patient } from './types';

export const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Jane Doe',
    lastHba1c: { value: 5.8, date: '2024-05-15' },
    lastLipid: { ldl: 110, date: '2024-03-20' },
    status: 'Needs Review',
  },
  {
    id: '2',
    name: 'John Smith',
    lastHba1c: { value: 7.2, date: '2024-06-01' },
    lastLipid: null,
    status: 'Urgent',
  },
  {
    id: '3',
    name: 'Emily White',
    lastHba1c: { value: 5.4, date: '2024-04-10' },
    lastLipid: { ldl: 95, date: '2024-04-10' },
    status: 'On Track',
  },
   {
    id: '4',
    name: 'Michael Brown',
    lastHba1c: null,
    lastLipid: { ldl: 130, date: '2024-01-12' },
    status: 'Needs Review',
  },
];
