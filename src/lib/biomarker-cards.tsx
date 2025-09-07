

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
import { TotalCholesterolCard } from '@/components/total-cholesterol-card';
import { AddTotalCholesterolRecordDialog } from '@/components/add-total-cholesterol-record-dialog';
import { LdlCard } from '@/components/ldl-card';
import { AddLdlRecordDialog } from '@/components/add-ldl-record-dialog';
import { HdlCard } from '@/components/hdl-card';
import { AddHdlRecordDialog } from '@/components/add-hdl-record-dialog';
import { TriglyceridesCard } from '@/components/triglycerides-card';
import { AddTriglyceridesRecordDialog } from '@/components/add-triglycerides-record-dialog';
import { DiabetesCard } from '@/components/diabetes-card';
import { HypertensionCard } from '@/components/hypertension-card';
import { LipidsPanel } from '@/components/lipids-panel';
import { BiomarkerKey, DiseasePanelKey } from './types';


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
  totalCholesterol: {
    label: 'Total Cholesterol',
    component: <TotalCholesterolCard />,
    addRecordLabel: 'New Total Cholesterol Record',
    addRecordDialog: <AddTotalCholesterolRecordDialog />,
  },
  ldl: {
    label: 'LDL Cholesterol',
    component: <LdlCard />,
    addRecordLabel: 'New LDL Record',
    addRecordDialog: <AddLdlRecordDialog />,
  },
  hdl: {
    label: 'HDL Cholesterol',
    component: <HdlCard />,
    addRecordLabel: 'New HDL Record',
    addRecordDialog: <AddHdlRecordDialog />,
  },
  triglycerides: {
    label: 'Triglycerides',
    component: <TriglyceridesCard />,
    addRecordLabel: 'New Triglycerides Record',
    addRecordDialog: <AddTriglyceridesRecordDialog />,
  },
};

export const availableDiseasePanels = [
    { key: 'diabetes' as DiseasePanelKey, label: 'Diabetes Panel', component: <DiabetesCard /> },
    { key: 'hypertension' as DiseasePanelKey, label: 'Hypertension Panel', component: <HypertensionCard /> },
    { key: 'lipids' as DiseasePanelKey, label: 'Lipids Panel', component: <LipidsPanel /> },
];
