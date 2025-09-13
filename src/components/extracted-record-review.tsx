
'use client';

import { BatchRecords, useApp } from '@/context/app-context';
import { format, isValid, parse, parseISO } from 'date-fns';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Check, Edit, Save, AlertTriangle } from 'lucide-react';
import * as React from 'react';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { DatePicker } from './ui/date-picker';
import { toNgDl } from '@/lib/unit-conversions';

interface ExtractedRecordReviewProps {
  data: BatchRecords;
  onSave: (editedData: BatchRecords) => void;
  onCancel: () => void;
}

const RecordRow: React.FC<{ label: string; value?: string | number | null; unit?: string; onValueChange: (value: string) => void; onUnitChange?: (value: string) => void; isDate?: boolean; dateValue?: Date; onDateChange?: (date?: Date) => void; }> = ({ label, value, unit, onValueChange, onUnitChange, isDate, dateValue, onDateChange }) => {
  if (isDate) {
    return (
       <div className="flex justify-between items-center py-2">
            <Label className="text-muted-foreground font-normal">{label}</Label>
            <DatePicker
                value={dateValue}
                onChange={onDateChange!}
            />
        </div>
    )
  }
  
  if (value === null || value === undefined) return null;
  
  return (
    <div className="flex justify-between items-center py-2">
      <Label htmlFor={label} className="text-muted-foreground font-normal">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          id={label}
          type="text"
          value={String(value)}
          onChange={(e) => onValueChange(e.target.value)}
          className="w-24 h-8 text-right"
        />
        {unit && (
             <Input
                type="text"
                value={unit}
                onChange={(e) => onUnitChange?.(e.target.value)}
                className="w-20 h-8 text-left"
                disabled={!onUnitChange}
            />
        )}
      </div>
    </div>
  );
};

export function ExtractedRecordReview({ data, onSave, onCancel }: ExtractedRecordReviewProps) {
  const { biomarkerUnit, profile } = useApp();
  const [editedData, setEditedData] = React.useState<BatchRecords>(data);

  React.useEffect(() => {
    setEditedData(data);
  }, [data]);
  
  const handleValueChange = (field: keyof BatchRecords, subField?: string) => (value: string) => {
    setEditedData(prev => {
        const newData = { ...prev };
        const record = newData[field];
        if (record && subField) {
            (record as any)[subField] = value;
        } else if (record) {
             (record as any).value = value;
        }
        return newData;
    });
  }
  
  const handleDateChange = (newDate?: Date) => {
    if (newDate && isValid(newDate)) {
        const isoDate = newDate.toISOString();
        setEditedData(prev => {
            const updated: BatchRecords = {};
            for (const key in prev) {
                if (key !== 'patientName' && prev[key as keyof BatchRecords]) {
                   (updated as any)[key] = { ...(prev[key as keyof BatchRecords] as object), date: isoDate };
                } else {
                   (updated as any)[key] = prev[key as keyof BatchRecords];
                }
            }
            return updated;
        });
    }
  }

  const nameMismatch = !!(editedData.patientName && profile.name.toLowerCase() !== editedData.patientName.toLowerCase());

  const getRecordDate = () => {
    for (const key in editedData) {
        if (key !== 'patientName') {
            const record = editedData[key as keyof Omit<BatchRecords, 'patientName'>];
            if (record && 'date' in record && record.date) {
                const parsedDate = parseISO(record.date);
                if (isValid(parsedDate)) {
                    return parsedDate;
                }
            }
        }
    }
    return new Date();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Review Extracted Data</CardTitle>
          <CardDescription>Please confirm or edit the information the AI extracted from your document.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          {nameMismatch && (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                    Warning: The name on the report (<strong>{editedData.patientName}</strong>) does not match the current patient profile (<strong>{profile.name}</strong>).
                </AlertDescription>
            </Alert>
          )}

          <div className="divide-y">
             <RecordRow 
                label="Test Date" 
                isDate 
                dateValue={getRecordDate()} 
                onDateChange={handleDateChange}
             />
            
            <RecordRow label="HbA1c (%)" value={editedData.hba1c?.value} onValueChange={handleValueChange('hba1c', 'value')} />
            <RecordRow label="Fasting Blood Glucose (mg/dL)" value={editedData.fastingBloodGlucose?.value} onValueChange={handleValueChange('fastingBloodGlucose', 'value')} />
            <RecordRow label="Hemoglobin (g/dL)" value={editedData.hemoglobin?.hemoglobin} onValueChange={handleValueChange('hemoglobin', 'hemoglobin')} />
            
            {editedData.bloodPressure && (
              <>
                <RecordRow label="Systolic BP (mmHg)" value={editedData.bloodPressure.systolic} onValueChange={handleValueChange('bloodPressure', 'systolic')} />
                <RecordRow label="Diastolic BP (mmHg)" value={editedData.bloodPressure.diastolic} onValueChange={handleValueChange('bloodPressure', 'diastolic')} />
                <RecordRow label="Heart Rate (bpm)" value={editedData.bloodPressure.heartRate} onValueChange={handleValueChange('bloodPressure', 'heartRate')} />
              </>
            )}

            {editedData.thyroid && (
              <>
                <RecordRow label="TSH (µIU/mL)" value={editedData.thyroid.tsh} onValueChange={handleValueChange('thyroid', 'tsh')} />
                <RecordRow label="T3 (pg/mL)" value={editedData.thyroid.t3} onValueChange={handleValueChange('thyroid', 't3')} />
                <RecordRow label="T4 (ng/dL)" value={editedData.thyroid.t4} onValueChange={handleValueChange('thyroid', 't4')} />
              </>
            )}

            {editedData.lipidPanel && (
              <>
                <RecordRow label="Total Cholesterol (mg/dL)" value={editedData.lipidPanel.totalCholesterol} onValueChange={handleValueChange('lipidPanel', 'totalCholesterol')} />
                <RecordRow label="LDL (mg/dL)" value={editedData.lipidPanel.ldl} onValueChange={handleValueChange('lipidPanel', 'ldl')} />
                <RecordRow label="HDL (mg/dL)" value={editedData.lipidPanel.hdl} onValueChange={handleValueChange('lipidPanel', 'hdl')} />
                <RecordRow label="Triglycerides (mg/dL)" value={editedData.lipidPanel.triglycerides} onValueChange={handleValueChange('lipidPanel', 'triglycerides')} />
              </>
            )}
          </div>

        </CardContent>
      </Card>
      
      <div className="flex justify-between gap-2">
        <Button variant="ghost" onClick={onCancel}>
          <Edit className="mr-2 h-4 w-4" /> Re-upload
        </Button>
        <Button onClick={() => onSave(editedData)}>
          <Check className="mr-2 h-4 w-4" /> Confirm and Save
        </Button>
      </div>
    </div>
  );
}
