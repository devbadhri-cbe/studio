
import type { Patient } from './types';

export const MOCK_PATIENTS: Patient[] = [
  {
    id: '1',
    name: 'Eleanor Vance',
    dob: '1965-08-15',
    gender: 'female',
    email: 'eleanor.vance@example.com',
    country: 'US',
    phone: '+1 (555) 123-4567',
    height: 165,
    bmi: 24.5,
    lastHba1c: { value: 6.8, date: '2024-05-10' },
    lastLipid: { ldl: 120, date: '2024-05-10' },
    lastVitaminD: { value: 25, date: '2024-01-20' },
    lastThyroid: { tsh: 3.5, date: '2024-01-20' },
    lastBloodPressure: { systolic: 135, diastolic: 85, date: '2024-06-01' },
    status: 'Needs Review',
    records: [
      { id: 'rec1', date: '2024-05-10', value: 6.8, medication: '[{"name":"Metformin","dosage":"500mg","frequency":"Twice a day"}]' },
      { id: 'rec2', date: '2024-01-15', value: 7.1, medication: '[]' },
    ],
    lipidRecords: [
       { id: 'lip1', date: '2024-05-10', total: 200, ldl: 120, hdl: 50, triglycerides: 150, medication: '[{"name":"Metformin","dosage":"500mg","frequency":"Twice a day"}]' }
    ],
    vitaminDRecords: [
      { id: 'vitd1', date: '2024-01-20', value: 25, medication: '[]' }
    ],
    thyroidRecords: [
       { id: 'thy1', date: '2024-01-20', tsh: 3.5, t3: 130, t4: 8.5, medication: '[]' }
    ],
    bloodPressureRecords: [
      { id: 'bp1', date: '2024-06-01', systolic: 135, diastolic: 85, medication: '[{"name":"Metformin","dosage":"500mg","frequency":"Twice a day"}]' }
    ],
    weightRecords: [
        { id: 'w1', date: '2024-06-01', value: 67 },
    ],
    medication: [{ id: 'med1', name: 'Metformin', dosage: '500mg', frequency: 'Twice a day' }],
    presentMedicalConditions: [{ id: 'cond1', date: '2022-01-01', condition: 'Type 2 Diabetes', icdCode: 'E11.9' }],
  },
  {
    id: '2',
    name: 'Marcus Thorne',
    dob: '1972-03-22',
    gender: 'male',
    email: 'marcus.thorne@example.com',
    country: 'GB',
    phone: '+44 20 7946 0958',
    height: 180,
    bmi: 28.1,
    lastHba1c: { value: 7.5, date: '2024-04-20' },
    lastLipid: { ldl: 150, date: '2024-04-20' },
    lastVitaminD: { value: 45, date: '2024-04-20' },
    lastThyroid: null,
    lastBloodPressure: { systolic: 145, diastolic: 92, date: '2024-06-15' },
    status: 'Urgent',
    records: [{ id: 'rec3', date: '2024-04-20', value: 7.5, medication: '[{"name":"Lisinopril","dosage":"10mg","frequency":"Once a day"}]' }],
    lipidRecords: [{ id: 'lip2', date: '2024-04-20', total: 240, ldl: 150, hdl: 40, triglycerides: 250, medication: '[{"name":"Lisinopril","dosage":"10mg","frequency":"Once a day"}]' }],
    vitaminDRecords: [{ id: 'vitd2', date: '2024-04-20', value: 45, medication: '[{"name":"Lisinopril","dosage":"10mg","frequency":"Once a day"}]' }],
    thyroidRecords: [],
    bloodPressureRecords: [{ id: 'bp2', date: '2024-06-15', systolic: 145, diastolic: 92, medication: '[{"name":"Lisinopril","dosage":"10mg","frequency":"Once a day"}]' }],
    weightRecords: [{ id: 'w2', date: '2024-06-15', value: 91 }],
    medication: [{ id: 'med2', name: 'Lisinopril', dosage: '10mg', frequency: 'Once a day' }],
    presentMedicalConditions: [{ id: 'cond2', date: '2020-05-10', condition: 'Hypertension', icdCode: 'I10' }],
  },
  {
    id: '3',
    name: 'Isabella Rossi',
    dob: '1988-11-05',
    gender: 'female',
    email: 'isabella.rossi@example.com',
    country: 'IN',
    phone: '+91 98765 43210',
    height: 160,
    bmi: 21.5,
    lastHba1c: { value: 5.5, date: '2024-03-30' },
    lastLipid: { ldl: 95, date: '2024-03-30' },
    lastVitaminD: null,
    lastThyroid: { tsh: 2.1, date: '2024-03-30' },
    lastBloodPressure: { systolic: 110, diastolic: 70, date: '2024-06-20' },
    status: 'On Track',
    records: [{ id: 'rec4', date: '2024-03-30', value: 5.5, medication: '[]' }],
    lipidRecords: [{ id: 'lip3', date: '2024-03-30', total: 180, ldl: 95, hdl: 60, triglycerides: 125, medication: '[]' }],
    vitaminDRecords: [],
    thyroidRecords: [{ id: 'thy2', date: '2024-03-30', tsh: 2.1, t3: 110, t4: 7.5, medication: '[]' }],
    bloodPressureRecords: [{ id: 'bp3', date: '2024-06-20', systolic: 110, diastolic: 70, medication: '[]' }],
    weightRecords: [{ id: 'w3', date: '2024-06-20', value: 55 }],
    medication: [],
    presentMedicalConditions: [],
  },
];
