

import { Hba1cCard } from '@/components/hba1c-card';
import { FastingBloodGlucoseCard } from '@/components/fasting-blood-glucose-card';
import { HemoglobinCard } from '@/components/hemoglobin-card';
import { BloodPressureCard } from '@/components/blood-pressure-card';
import { ThyroidCard } from '@/components/thyroid-card';
import { VitaminDCard } from '@/components/vitamin-d-card';
import { WeightRecordCard } from '@/components/weight-record-card';
import { AddRecordDialog } from '@/components/add-record-dialog';
import { AddFastingBloodGlucoseRecordDialog } from '@/components/add-fasting-blood-glucose-record-dialog';
import { AddHemoglobinRecordDialog } from '@/components/add-hemoglobin-record-dialog';
import { AddBloodPressureRecordDialog } from '@/components/add-blood-pressure-record-dialog';
import { AddThyroidRecordDialog } from '@/components/add-thyroid-record-dialog';
import { AddVitaminDRecordDialog } from '@/components/add-vitamin-d-record-dialog';
import { AddWeightRecordDialog } from '@/components/add-weight-record-dialog';
import { LipidCard } from '@/components/lipid-card';
import { AddLipidRecordDialog } from '@/components/add-lipid-record-dialog';

export const availableBiomarkerCards = {
  hba1c: {
    label: 'HbA1c',
    component: <Hba1cCard key="hba1c" isReadOnly />,
    addRecordLabel: 'New HbA1c Record',
    addRecordDialog: <AddRecordDialog />,
  },
  glucose: {
    label: 'Fasting Blood Glucose',
    component: <FastingBloodGlucoseCard key="fbg" isReadOnly />,
    addRecordLabel: 'New Fasting Glucose Record',
    addRecordDialog: <AddFastingBloodGlucoseRecordDialog />,
  },
  hemoglobin: {
    label: 'Hemoglobin (Anemia)',
    component: <HemoglobinCard key="hemoglobin" isReadOnly />,
    addRecordLabel: 'New Hemoglobin Record',
    addRecordDialog: <AddHemoglobinRecordDialog />,
  },
  bloodPressure: {
    label: 'Blood Pressure',
    component: <BloodPressureCard key="bloodPressure" isReadOnly />,
    addRecordLabel: 'New Blood Pressure Record',
    addRecordDialog: <AddBloodPressureRecordDialog />,
  },
  thyroid: {
    label: 'Thyroid',
    component: <ThyroidCard />,
    addRecordLabel: 'New Thyroid Record',
    addRecordDialog: <AddThyroidRecordDialog />,
  },
  vitaminD: {
    label: 'Vitamin D',
    component: <VitaminDCard />,
    addRecordLabel: 'New Vitamin D Record',
    addRecordDialog: <AddVitaminDRecordDialog />,
  },
  weight: {
    label: 'Weight & BMI',
    component: <WeightRecordCard />,
    addRecordLabel: 'New Weight Record',
    addRecordDialog: <AddWeightRecordDialog />,
  },
};

export type BiomarkerKey = keyof typeof availableBiomarkerCards;
