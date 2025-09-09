
'use client';

import { BatchRecords, useApp } from '@/context/app-context';
import { format, isValid, parseISO } from 'date-fns';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Check, Edit, Save } from 'lucide-react';
import * as React from 'react';
import { Separator } from './ui/separator';

interface ExtractedRecordReviewProps {
  data: BatchRecords;
  onSave: () => void;
  onCancel: () => void;
}

const RecordRow: React.FC<{ label: string; value?: string | number | null; unit?: string }> = ({ label, value, unit }) => {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="flex justify-between items-center text-sm py-2">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-semibold">{value} {unit}</p>
    </div>
  );
};

export function ExtractedRecordReview({ data, onSave, onCancel }: ExtractedRecordReviewProps) {
  const { getDisplayVitaminDValue, biomarkerUnit } = useApp();
  const date = data.hba1c?.date || data.fastingBloodGlucose?.date || data.vitaminD?.date || data.thyroid?.date;
  const formattedDate = date && isValid(new Date(date)) ? format(new Date(date), 'PPP') : 'N/A';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Review Extracted Data</CardTitle>
          <CardDescription>Please confirm that the AI extracted the correct information from your document.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-muted rounded-md">
            <p className="font-semibold">Test Date</p>
            <p className="font-bold text-primary">{formattedDate}</p>
          </div>

          <Separator />
          
          <div className="divide-y">
            <RecordRow label="HbA1c" value={data.hba1c?.value} unit="%" />
            <RecordRow label="Fasting Blood Glucose" value={data.fastingBloodGlucose?.value} unit="mg/dL" />
            <RecordRow label="Hemoglobin" value={data.hemoglobin?.hemoglobin} unit="g/dL" />
            
            {data.vitaminD?.value && (
              <RecordRow 
                label="Vitamin D" 
                value={getDisplayVitaminDValue(data.vitaminD.value)} 
                unit={biomarkerUnit === 'si' ? 'nmol/L' : 'ng/mL'} 
              />
            )}

            {data.bloodPressure && (
              <>
                <RecordRow label="Systolic BP" value={data.bloodPressure.systolic} unit="mmHg" />
                <RecordRow label="Diastolic BP" value={data.bloodPressure.diastolic} unit="mmHg" />
                <RecordRow label="Heart Rate" value={data.bloodPressure.heartRate} unit="bpm" />
              </>
            )}

            {data.thyroid && (
              <>
                <RecordRow label="TSH" value={data.thyroid.tsh} unit="µIU/mL" />
                <RecordRow label="T3" value={data.thyroid.t3} unit="pg/mL" />
                <RecordRow label="T4" value={data.thyroid.t4} unit="ng/dL" />
              </>
            )}

            {data.lipidPanel && (
              <>
                <RecordRow label="Total Cholesterol" value={data.lipidPanel.totalCholesterol} unit="mg/dL" />
                <RecordRow label="LDL" value={data.lipidPanel.ldl} unit="mg/dL" />
                <RecordRow label="HDL" value={data.lipidPanel.hdl} unit="mg/dL" />
                <RecordRow label="Triglycerides" value={data.lipidPanel.triglycerides} unit="mg/dL" />
              </>
            )}
          </div>

        </CardContent>
      </Card>
      
      <div className="flex justify-between gap-2">
        <Button variant="ghost" onClick={onCancel}>
          <Edit className="mr-2 h-4 w-4" /> Re-upload
        </Button>
        <Button onClick={onSave}>
          <Check className="mr-2 h-4 w-4" /> Confirm and Save
        </Button>
      </div>
    </div>
  );
}
