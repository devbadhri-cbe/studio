
import { Hba1cCard } from '@/components/hba1c-card';
import { FastingBloodGlucoseCard } from '@/components/fasting-blood-glucose-card';
import { HemoglobinCard } from '@/components/hemoglobin-card';
import { BloodPressureCard } from '@/components/blood-pressure-card';
import { ThyroidCard } from '@/components/thyroid-card';
import { VitaminDCard } from '@/components/vitamin-d-card';
import { WeightRecordCard } from '@/components/weight-record-card';

export const availableBiomarkerCards = {
  hba1c: {
    label: 'HbA1c',
    component: <Hba1cCard key="hba1c" isReadOnly />,
  },
  glucose: {
    label: 'Fasting Blood Glucose',
    component: <FastingBloodGlucoseCard key="fbg" isReadOnly />,
  },
  hemoglobin: {
    label: 'Hemoglobin (Anemia)',
    component: <HemoglobinCard key="hemoglobin" isReadOnly />,
  },
  bloodPressure: {
    label: 'Blood Pressure',
    component: <BloodPressureCard key="bloodPressure" isReadOnly />,
  },
  thyroid: {
    label: 'Thyroid',
    component: <ThyroidCard key="thyroid" />,
  },
  vitaminD: {
    label: 'Vitamin D',
    component: <VitaminDCard key="vitaminD" />,
  },
  weight: {
    label: 'Weight & BMI',
    component: <WeightRecordCard key="weight" />,
  },
};

export type BiomarkerKey = keyof typeof availableBiomarkerCards;
