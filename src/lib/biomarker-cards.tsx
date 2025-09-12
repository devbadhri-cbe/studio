

import { Hba1cCard } from '@/components/hba1c-card';
import { FastingBloodGlucoseCard } from '@/components/fasting-blood-glucose-card';
import { HemoglobinCard } from '@/components/hemoglobin-card';
import { BloodPressureCard } from '@/components/blood-pressure-card';
import { ThyroidCard } from '@/components/thyroid-card';
import { ThyroxineCard } from '@/components/thyroxine-card';
import { WeightRecordCard } from '@/components/weight-record-card';
import { AddRecordDialog } from '@/components/add-record-dialog';
import { AddFastingBloodGlucoseRecordDialog } from '@/components/add-fasting-blood-glucose-record-dialog';
import { AddHemoglobinRecordDialog } from '@/components/add-hemoglobin-record-dialog';
import { AddBloodPressureRecordDialog } from '@/components/add-blood-pressure-record-dialog';
import { AddThyroidRecordDialog } from '@/components/add-thyroid-record-dialog';
import { AddThyroxineRecordDialog } from '@/components/add-thyroxine-record-dialog';
import { AddWeightRecordDialog } from '@/components/add-weight-record-dialog';
import { DiabetesCard } from '@/components/diabetes-card';
import { HypertensionCard } from '@/components/hypertension-card';
import { BiomarkerKey, DiseasePanelKey } from './types';
import { AddLipidRecordDialog } from '@/components/add-lipid-record-dialog';
import { LipidCard } from '@/components/lipid-card';
import { TotalCholesterolCard } from '@/components/total-cholesterol-card';
import { AddTotalCholesterolRecordDialog } from '@/components/add-total-cholesterol-record-dialog';
import { LdlCard } from '@/components/ldl-card';
import { AddLdlRecordDialog } from '@/components/add-ldl-record-dialog';
import { HdlCard } from '@/components/hdl-card';
import { AddHdlRecordDialog } from '@/components/add-hdl-record-dialog';
import { TriglyceridesCard } from '@/components/triglycerides-card';
import { AddTriglyceridesRecordDialog } from '@/components/add-triglycerides-record-dialog';
import { LipidPanelCard } from '@/components/lipid-panel-card';
import { SerumCreatinineCard } from '@/components/serum-creatinine-card';
import { AddSerumCreatinineRecordDialog } from '@/components/add-serum-creatinine-record-dialog';
import { UricAcidCard } from '@/components/uric-acid-card';
import { AddUricAcidRecordDialog } from '@/components/add-uric-acid-record-dialog';
import { ProfileCard } from '@/components/profile-card';
import { MedicalHistoryCard } from '@/components/medical-history-card';
import React from 'react';


export const mainDashboardCards = {
  profile: <ProfileCard />,
  medicalHistory: <MedicalHistoryCard />,
  weight: <WeightRecordCard />,
  bloodPressure: <BloodPressureCard />,
}

export const getEnabledCards = (enabledBiomarkers?: { [key: string]: string[] }): React.ReactNode[] => {
  if (!enabledBiomarkers || !enabledBiomarkers.dashboard) {
    return [];
  }
  return enabledBiomarkers.dashboard
    .map(key => (mainDashboardCards as any)[key])
    .filter(Boolean);
};


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
  thyroxine: {
    label: 'Thyroxine (T4)',
    component: <ThyroxineCard />,
    addRecordLabel: 'New Thyroxine (T4) Record',
    addRecordDialog: <AddThyroxineRecordDialog />,
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
  serumCreatinine: {
    label: 'Serum Creatinine',
    component: <SerumCreatinineCard />,
    addRecordLabel: 'New Serum Creatinine Record',
    addRecordDialog: <AddSerumCreatinineRecordDialog />,
  },
  uricAcid: {
    label: 'Uric Acid',
    component: <UricAcidCard />,
    addRecordLabel: 'New Uric Acid Record',
    addRecordDialog: <AddUricAcidRecordDialog />,
  },
};

export const availableDiseasePanels = [
    { key: 'diabetes' as DiseasePanelKey, label: 'Diabetes Panel', component: <DiabetesCard /> },
    { key: 'hypertension' as DiseasePanelKey, label: 'Hypertension Panel', component: <HypertensionCard /> },
    { key: 'lipidPanel' as DiseasePanelKey, label: 'Lipid Panel', component: <LipidPanelCard /> },
];
