
'use client';

import type { LabResultUploadOutput } from '@/ai/flows/lab-result-upload';
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { FileText, FlaskConical, Sun, Droplet, Activity, Zap, AlertCircle } from 'lucide-react';
import * as React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { DatePicker } from './ui/date-picker';
import { parseISO, isValid } from 'date-fns';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface UploadConfirmationFormProps {
  extractedData: LabResultUploadOutput;
  onCancel: () => void;
  onSuccess: () => void;
}

export function UploadConfirmationForm({ extractedData: initialData, onCancel, onSuccess }: UploadConfirmationFormProps) {
  const [extractedData, setExtractedData] = React.useState<LabResultUploadOutput>(initialData);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { addBatchRecords, biomarkerUnit } = useApp();
  const { toast } = useToast();
  const formatDate = useDateFormatter();

  const hasAnyData = extractedData.hba1cValue || extractedData.lipidPanel || extractedData.vitaminDValue || extractedData.thyroidPanel || extractedData.bloodPressure;
  const isDateValid = extractedData.date && isValid(parseISO(extractedData.date));

  const expectedLipidUnit = biomarkerUnit === 'conventional' ? 'mg/dL' : 'mmol/L';
  const lipidUnitMismatch = extractedData.lipidPanel?.units && extractedData.lipidPanel.units !== expectedLipidUnit;
  
  const expectedVitaminDUnit = biomarkerUnit === 'conventional' ? 'ng/mL' : 'nmol/L';
  const vitaminDUnitMismatch = extractedData.vitaminDUnits && extractedData.vitaminDUnits !== expectedVitaminDUnit;

  const canConfirm = hasAnyData && isDateValid && !lipidUnitMismatch && !vitaminDUnitMismatch;

  const handleDataConfirmation = async () => {
    if (!extractedData) return;

    setIsSubmitting(true);

    const { hba1cValue, lipidPanel, vitaminDValue, vitaminDUnits, thyroidPanel, bloodPressure, date } = extractedData;
    
    if (!date || !isValid(parseISO(date))) {
        toast({
            variant: 'destructive',
            title: 'Valid Date Required',
            description: 'Please select a valid date for the report before saving.',
        });
        setIsSubmitting(false);
        return;
    }
    
    const { added, duplicates } = await addBatchRecords({
      hba1c: hba1cValue ? { value: hba1cValue, date } : undefined,
      lipid: lipidPanel ? { ...lipidPanel, date, units: lipidPanel.units } : undefined,
      vitaminD: (vitaminDValue && vitaminDUnits) ? { value: vitaminDValue, date, units: vitaminDUnits } : undefined,
      thyroid: thyroidPanel ? { ...thyroidPanel, date } : undefined,
      bloodPressure: bloodPressure ? { ...bloodPressure, date } : undefined,
    });
    
    if (added.length > 0 && duplicates.length === 0) {
      toast({
        title: 'Records Added!',
        description: `${added.join(', ')} records have been updated successfully.`,
      });
    } else if (added.length > 0 && duplicates.length > 0) {
       toast({
        title: 'Some Records Added',
        description: `${added.join(', ')} were added. Duplicates for ${duplicates.join(', ')} were skipped.`,
      });
    } else if (added.length === 0 && duplicates.length > 0) {
        toast({
            variant: 'destructive',
            title: 'No New Records Added',
            description: `All extracted records for this date already exist: ${duplicates.join(', ')}.`,
        });
    } else {
         toast({
            variant: 'destructive',
            title: 'No Data to Add',
            description: 'No new information was found to add to your records.',
        });
    }
    setIsSubmitting(false);
    onSuccess();
  };
  
  const handleManualEntry = (field: keyof LabResultUploadOutput, value: string | number | object) => {
      const updatedData = { ...extractedData };
      
      if (typeof value === 'object') {
          (updatedData as any)[field] = { ...(updatedData as any)[field], ...value };
      } else {
           (updatedData as any)[field] = value;
      }

      if (field === 'vitaminDValue' && !updatedData.vitaminDUnits) {
          updatedData.vitaminDUnits = expectedVitaminDUnit;
      }
      if (field === 'lipidPanel' && !updatedData.lipidPanel?.units) {
           if (updatedData.lipidPanel) updatedData.lipidPanel.units = expectedLipidUnit;
      }

      setExtractedData(updatedData);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirm Uploaded Results</CardTitle>
        <CardDescription>
          Review the AI-extracted information below. You can correct any field before adding the data to your records.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 rounded-md border bg-muted/50 p-3">
          <FileText className="h-5 w-5 text-primary" />
           <div className="flex-1">
              <p className="font-semibold">Report Date</p>
              {isDateValid ? (
                  <p className="text-sm text-muted-foreground">
                      {formatDate(extractedData.date!)}
                  </p>
              ) : (
                   <div className="space-y-2">
                      <p className="text-sm text-destructive">Date not found. Please select one.</p>
                      <DatePicker 
                          placeholder='Select a date'
                          value={extractedData.date ? parseISO(extractedData.date) : undefined}
                          onChange={(newDate) => {
                              if (newDate) {
                                  setExtractedData({ ...extractedData, date: newDate.toISOString().split('T')[0] })
                              }
                          }}
                      />
                  </div>
              )}
          </div>
        </div>

        <Separator />

        <h4 className="font-medium text-center text-muted-foreground">Extracted Results</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-3 rounded-md border p-2">
                <Droplet className="h-5 w-5 text-primary/80" />
                <div className="flex-1">
                    <Label htmlFor="hba1c-manual" className="font-semibold">HbA1c</Label>
                    {extractedData.hba1cValue ? (
                        <p>{extractedData.hba1cValue}%</p>
                    ) : (
                         <Input id="hba1c-manual" type="number" step="0.1" placeholder="Enter HbA1c" className="h-8 mt-1" onChange={e => handleManualEntry('hba1cValue', parseFloat(e.target.value))}/>
                    )}
                </div>
            </div>
            
            <div className="flex items-center gap-3 rounded-md border p-2">
               <Sun className="h-5 w-5 text-primary/80" />
               <div className="flex-1">
                   <Label htmlFor="vitd-manual" className="font-semibold">Vitamin D</Label>
                   {extractedData.vitaminDValue ? (
                        <p>{extractedData.vitaminDValue} {extractedData.vitaminDUnits}</p>
                   ): (
                        <Input id="vitd-manual" type="number" placeholder={`Enter Vit D (${expectedVitaminDUnit})`} className="h-8 mt-1" onChange={e => handleManualEntry('vitaminDValue', parseFloat(e.target.value))}/>
                   )}
               </div>
                {vitaminDUnitMismatch && (
                     <Tooltip>
                        <TooltipTrigger>
                            <AlertCircle className="h-4 w-4 text-destructive" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Unit mismatch. Expected {expectedVitaminDUnit}.</p>
                        </TooltipContent>
                     </Tooltip>
                )}
           </div>
           
           <div className="flex items-center gap-3 rounded-md border p-2">
               <Zap className="h-5 w-5 text-primary/80" />
               <div className="flex-1">
                   <p className="font-semibold">Blood Pressure</p>
                   {extractedData.bloodPressure ? (
                       <p>{extractedData.bloodPressure.systolic}/{extractedData.bloodPressure.diastolic} mmHg</p>
                   ) : (
                        <div className="flex gap-2 mt-1">
                            <Input type="number" placeholder="Systolic" className="h-8" onChange={e => handleManualEntry('bloodPressure', { systolic: parseFloat(e.target.value) })}/>
                            <Input type="number" placeholder="Diastolic" className="h-8" onChange={e => handleManualEntry('bloodPressure', { diastolic: parseFloat(e.target.value) })}/>
                        </div>
                   )}
               </div>
           </div>
        </div>

        <div className="rounded-md border p-2 space-y-2">
            <div className="flex items-center gap-3">
                 <FlaskConical className="h-5 w-5 text-primary/80" />
                 <p className="font-semibold">Lipid Panel ({extractedData.lipidPanel?.units || expectedLipidUnit})</p>
                  {lipidUnitMismatch && (
                     <Tooltip>
                        <TooltipTrigger>
                            <AlertCircle className="h-4 w-4 text-destructive" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Unit mismatch. Expected {expectedLipidUnit}.</p>
                        </TooltipContent>
                     </Tooltip>
                )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs">
                 <div className="rounded-md bg-muted/50 p-2">
                    <Label htmlFor="total-manual" className="font-semibold">Total</Label>
                     {extractedData.lipidPanel?.total ? (<p>{extractedData.lipidPanel.total}</p>) : (<Input id="total-manual" type="number" className="h-7 mt-1 text-center" onChange={e => handleManualEntry('lipidPanel', { total: parseFloat(e.target.value) })}/>) }
                </div>
                <div className="rounded-md bg-muted/50 p-2">
                    <Label htmlFor="ldl-manual" className="font-semibold">LDL</Label>
                    {extractedData.lipidPanel?.ldl ? (<p>{extractedData.lipidPanel.ldl}</p>) : (<Input id="ldl-manual" type="number" className="h-7 mt-1 text-center" onChange={e => handleManualEntry('lipidPanel', { ldl: parseFloat(e.target.value) })}/>) }
                </div>
                <div className="rounded-md bg-muted/50 p-2">
                    <Label htmlFor="hdl-manual" className="font-semibold">HDL</Label>
                    {extractedData.lipidPanel?.hdl ? (<p>{extractedData.lipidPanel.hdl}</p>) : (<Input id="hdl-manual" type="number" className="h-7 mt-1 text-center" onChange={e => handleManualEntry('lipidPanel', { hdl: parseFloat(e.target.value) })}/>) }
                </div>
                 <div className="rounded-md bg-muted/50 p-2">
                    <Label htmlFor="trig-manual" className="font-semibold">Trig.</Label>
                    {extractedData.lipidPanel?.triglycerides ? (<p>{extractedData.lipidPanel.triglycerides}</p>) : (<Input id="trig-manual" type="number" className="h-7 mt-1 text-center" onChange={e => handleManualEntry('lipidPanel', { triglycerides: parseFloat(e.target.value) })}/>) }
                </div>
            </div>
        </div>

         <div className="rounded-md border p-2 space-y-2">
            <div className="flex items-center gap-3">
                 <Activity className="h-5 w-5 text-primary/80" />
                 <p className="font-semibold">Thyroid Panel</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                 <div className="rounded-md bg-muted/50 p-2">
                    <Label htmlFor="tsh-manual" className="font-semibold">TSH (μIU/mL)</Label>
                    {extractedData.thyroidPanel?.tsh ? (<p>{extractedData.thyroidPanel.tsh}</p>) : (<Input id="tsh-manual" type="number" className="h-7 mt-1 text-center" onChange={e => handleManualEntry('thyroidPanel', { tsh: parseFloat(e.target.value) })}/>) }
                </div>
                <div className="rounded-md bg-muted/50 p-2">
                    <Label htmlFor="t3-manual" className="font-semibold">T3 (ng/dL)</Label>
                    {extractedData.thyroidPanel?.t3 ? (<p>{extractedData.thyroidPanel.t3}</p>) : (<Input id="t3-manual" type="number" className="h-7 mt-1 text-center" onChange={e => handleManualEntry('thyroidPanel', { t3: parseFloat(e.target.value) })}/>) }
                </div>
                <div className="rounded-md bg-muted/50 p-2">
                    <Label htmlFor="t4-manual" className="font-semibold">T4 (μg/dL)</Label>
                    {extractedData.thyroidPanel?.t4 ? (<p>{extractedData.thyroidPanel.t4}</p>) : (<Input id="t4-manual" type="number" className="h-7 mt-1 text-center" onChange={e => handleManualEntry('thyroidPanel', { t4: parseFloat(e.target.value) })}/>) }
                </div>
            </div>
        </div>
        
        {!hasAnyData && (
            <p className="text-center text-muted-foreground text-sm py-4">No biomarker data could be extracted. Please enter results manually.</p>
        )}
         <div className="flex justify-end gap-2 pt-4">
          <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleDataConfirmation} disabled={!canConfirm || isSubmitting} isLoading={isSubmitting}>
              Confirm & Add Records
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
