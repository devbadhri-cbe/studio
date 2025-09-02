

'use client';

import type { LabResultUploadOutput } from '@/ai/flows/lab-result-upload';
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { FileText, FlaskConical, Sun, Droplet, Activity, Zap, AlertCircle, RefreshCw, Bone, Beaker, HeartCrack } from 'lucide-react';
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
  const [manualInputs, setManualInputs] = React.useState({
    hba1c: '',
    fastingBloodGlucose: '',
    vitD: '',
    systolic: '',
    diastolic: '',
    total: '',
    ldl: '',
    hdl: '',
    triglycerides: '',
    tsh: '',
    t3: '',
    t4: '',
    egfr: '',
    uacr: '',
    sodium: '',
    potassium: '',
    chloride: '',
    bicarbonate: '',
    calcium: '',
    phosphorus: '',
    pth: '',
    hemoglobin: '',
    albumin: '',
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { addBatchRecords, biomarkerUnit } = useApp();
  const { toast } = useToast();
  const formatDate = useDateFormatter();

  const hasAnyData = Object.values(extractedData).some(val => val !== undefined && val !== null && (typeof val !== 'object' || Object.keys(val).length > 0));
  const isDateValid = extractedData.date && isValid(parseISO(extractedData.date));

  const expectedLipidUnit = biomarkerUnit === 'conventional' ? 'mg/dL' : 'mmol/L';
  const lipidUnitMismatch = extractedData.lipidPanel?.units && extractedData.lipidPanel.units !== expectedLipidUnit;
  
  const expectedVitaminDUnit = biomarkerUnit === 'conventional' ? 'ng/mL' : 'nmol/L';
  const vitaminDUnitMismatch = extractedData.vitaminDUnits && extractedData.vitaminDUnits !== expectedVitaminDUnit;

  const canConfirm = hasAnyData && isDateValid && !lipidUnitMismatch && !vitaminDUnitMismatch;

  const handleDataConfirmation = async () => {
    if (!extractedData) return;

    setIsSubmitting(true);

    const { hba1cValue, fastingBloodGlucoseValue, lipidPanel, vitaminDValue, vitaminDUnits, thyroidPanel, bloodPressure, renalPanel, electrolytes, mineralBone, hemoglobin, albumin, date } = extractedData;
    
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
      fastingBloodGlucose: fastingBloodGlucoseValue ? { value: fastingBloodGlucoseValue, date } : undefined,
      lipid: lipidPanel ? { ...lipidPanel, date, units: lipidPanel.units } : undefined,
      vitaminD: (vitaminDValue && vitaminDUnits) ? { value: vitaminDValue, date, units: vitaminDUnits } : undefined,
      thyroid: thyroidPanel ? { ...thyroidPanel, date } : undefined,
      bloodPressure: bloodPressure ? { ...bloodPressure, date } : undefined,
      renal: renalPanel ? { ...renalPanel, date } : undefined,
      electrolytes: electrolytes ? { ...electrolytes, date } : undefined,
      mineralBone: mineralBone ? { ...mineralBone, date } : undefined,
      hemoglobin: hemoglobin,
      albumin: albumin,
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
  
  const handleManualEntryChange = (field: keyof typeof manualInputs, value: string) => {
    setManualInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleManualEntryBlur = (field: keyof LabResultUploadOutput, subfield?: string) => {
    const manualValue = (manualInputs as any)[subfield || field];

    if (manualValue) {
      const numericValue = parseFloat(manualValue);
      if (!isNaN(numericValue)) {
        setExtractedData(prev => {
          const updated = { ...prev };
          if (subfield) {
            (updated as any)[field] = { ...(updated as any)[field] || {}, [subfield]: numericValue };
          } else {
            (updated as any)[field] = numericValue;
          }
           if (field === 'vitaminDValue' && !updated.vitaminDUnits) {
                updated.vitaminDUnits = expectedVitaminDUnit;
            }
            if (field === 'lipidPanel' && !updated.lipidPanel?.units) {
                if (updated.lipidPanel) updated.lipidPanel.units = expectedLipidUnit;
            }
          return updated;
        });
      }
    }
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
                          fromYear={new Date().getFullYear() - 10}
                          toYear={new Date().getFullYear()}
                      />
                  </div>
              )}
          </div>
        </div>

        <Separator />

        <h4 className="font-medium text-center text-muted-foreground">Extracted Results</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
            {/* General & Common Panels */}
            <div className="flex items-center gap-3 rounded-md border p-2">
                <Droplet className="h-5 w-5 text-primary/80" />
                <div className="flex-1">
                    <Label htmlFor="hba1c-manual" className="font-semibold">HbA1c</Label>
                    {extractedData.hba1cValue ? ( <p>{extractedData.hba1cValue}%</p> ) : (
                         <Input id="hba1c-manual" type="number" step="0.1" placeholder="Enter HbA1c" className="h-8 mt-1" 
                           value={manualInputs.hba1c} onChange={e => handleManualEntryChange('hba1c', e.target.value)} onBlur={() => handleManualEntryBlur('hba1cValue')} /> )}
                </div>
            </div>
            <div className="flex items-center gap-3 rounded-md border p-2">
                <Droplet className="h-5 w-5 text-primary/80" />
                <div className="flex-1">
                    <Label htmlFor="fbg-manual" className="font-semibold">Fasting Glucose</Label>
                    {extractedData.fastingBloodGlucoseValue ? ( <p>{extractedData.fastingBloodGlucoseValue} mg/dL</p> ) : (
                         <Input id="fbg-manual" type="number" placeholder="Enter Glucose" className="h-8 mt-1" 
                           value={manualInputs.fastingBloodGlucose} onChange={e => handleManualEntryChange('fastingBloodGlucose', e.target.value)} onBlur={() => handleManualEntryBlur('fastingBloodGlucoseValue')} /> )}
                </div>
            </div>
            <div className="flex items-center gap-3 rounded-md border p-2">
               <Sun className="h-5 w-5 text-primary/80" />
               <div className="flex-1">
                   <Label htmlFor="vitd-manual" className="font-semibold">Vitamin D</Label>
                   {extractedData.vitaminDValue ? ( <p>{extractedData.vitaminDValue} {extractedData.vitaminDUnits}</p> ): (
                        <Input id="vitd-manual" type="number" placeholder={`Enter Vit D (${expectedVitaminDUnit})`} className="h-8 mt-1" 
                          value={manualInputs.vitD} onChange={e => handleManualEntryChange('vitD', e.target.value)} onBlur={() => handleManualEntryBlur('vitaminDValue')} /> )}
               </div>
                {vitaminDUnitMismatch && ( <Tooltip><TooltipTrigger><AlertCircle className="h-4 w-4 text-destructive" /></TooltipTrigger><TooltipContent><p>Unit mismatch. Expected {expectedVitaminDUnit}.</p></TooltipContent></Tooltip> )}
           </div>
           <div className="flex items-center gap-3 rounded-md border p-2">
               <Zap className="h-5 w-5 text-primary/80" />
               <div className="flex-1">
                   <p className="font-semibold">Blood Pressure</p>
                   {extractedData.bloodPressure?.systolic && extractedData.bloodPressure?.diastolic ? ( <p>{extractedData.bloodPressure.systolic}/{extractedData.bloodPressure.diastolic} mmHg</p> ) : (
                        <div className="flex gap-2 mt-1">
                            <Input type="number" placeholder="Systolic" className="h-8" value={manualInputs.systolic} onChange={e => handleManualEntryChange('systolic', e.target.value)} onBlur={() => handleManualEntryBlur('bloodPressure', 'systolic')} />
                            <Input type="number" placeholder="Diastolic" className="h-8" value={manualInputs.diastolic} onChange={e => handleManualEntryChange('diastolic', e.target.value)} onBlur={() => handleManualEntryBlur('bloodPressure', 'diastolic')} />
                        </div> )}
               </div>
           </div>
        </div>

        {/* Lipid Panel */}
        <div className="rounded-md border p-2 space-y-2">
            <div className="flex items-center gap-3">
                 <FlaskConical className="h-5 w-5 text-primary/80" />
                 <p className="font-semibold">Lipid Panel ({extractedData.lipidPanel?.units || expectedLipidUnit})</p>
                  {lipidUnitMismatch && ( <Tooltip><TooltipTrigger><AlertCircle className="h-4 w-4 text-destructive" /></TooltipTrigger><TooltipContent><p>Unit mismatch. Expected {expectedLipidUnit}.</p></TooltipContent></Tooltip> )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs">
                 <div className="rounded-md bg-muted/50 p-2">
                    <Label htmlFor="total-manual" className="font-semibold">Total</Label>
                     {extractedData.lipidPanel?.total ? (<p>{extractedData.lipidPanel.total}</p>) : (<Input id="total-manual" type="number" className="h-7 mt-1 text-center" value={manualInputs.total} onChange={e => handleManualEntryChange('total', e.target.value)} onBlur={() => handleManualEntryBlur('lipidPanel', 'total')} />) }
                </div>
                <div className="rounded-md bg-muted/50 p-2">
                    <Label htmlFor="ldl-manual" className="font-semibold">LDL</Label>
                    {extractedData.lipidPanel?.ldl ? (<p>{extractedData.lipidPanel.ldl}</p>) : (<Input id="ldl-manual" type="number" className="h-7 mt-1 text-center" value={manualInputs.ldl} onChange={e => handleManualEntryChange('ldl', e.target.value)} onBlur={() => handleManualEntryBlur('lipidPanel', 'ldl')} />) }
                </div>
                <div className="rounded-md bg-muted/50 p-2">
                    <Label htmlFor="hdl-manual" className="font-semibold">HDL</Label>
                    {extractedData.lipidPanel?.hdl ? (<p>{extractedData.lipidPanel.hdl}</p>) : (<Input id="hdl-manual" type="number" className="h-7 mt-1 text-center" value={manualInputs.hdl} onChange={e => handleManualEntryChange('hdl', e.target.value)} onBlur={() => handleManualEntryBlur('lipidPanel', 'hdl')} />) }
                </div>
                 <div className="rounded-md bg-muted/50 p-2">
                    <Label htmlFor="trig-manual" className="font-semibold">Trig.</Label>
                    {extractedData.lipidPanel?.triglycerides ? (<p>{extractedData.lipidPanel.triglycerides}</p>) : (<Input id="trig-manual" type="number" className="h-7 mt-1 text-center" value={manualInputs.triglycerides} onChange={e => handleManualEntryChange('triglycerides', e.target.value)} onBlur={() => handleManualEntryBlur('lipidPanel', 'triglycerides')} />) }
                </div>
            </div>
        </div>

        {/* Thyroid Panel */}
         <div className="rounded-md border p-2 space-y-2">
            <div className="flex items-center gap-3">
                 <Activity className="h-5 w-5 text-primary/80" />
                 <p className="font-semibold">Thyroid Panel</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                 <div className="rounded-md bg-muted/50 p-2">
                    <Label htmlFor="tsh-manual" className="font-semibold">TSH (μIU/mL)</Label>
                    {extractedData.thyroidPanel?.tsh ? (<p>{extractedData.thyroidPanel.tsh}</p>) : (<Input id="tsh-manual" type="number" className="h-7 mt-1 text-center" value={manualInputs.tsh} onChange={e => handleManualEntryChange('tsh', e.target.value)} onBlur={() => handleManualEntryBlur('thyroidPanel', 'tsh')} />) }
                </div>
                <div className="rounded-md bg-muted/50 p-2">
                    <Label htmlFor="t3-manual" className="font-semibold">T3 (pg/mL)</Label>
                    {extractedData.thyroidPanel?.t3 ? (<p>{extractedData.thyroidPanel.t3}</p>) : (<Input id="t3-manual" type="number" className="h-7 mt-1 text-center" value={manualInputs.t3} onChange={e => handleManualEntryChange('t3', e.target.value)} onBlur={() => handleManualEntryBlur('thyroidPanel', 't3')} />) }
                </div>
                <div className="rounded-md bg-muted/50 p-2">
                    <Label htmlFor="t4-manual" className="font-semibold">T4 (ng/dL)</Label>
                    {extractedData.thyroidPanel?.t4 ? (<p>{extractedData.thyroidPanel.t4}</p>) : (<Input id="t4-manual" type="number" className="h-7 mt-1 text-center" value={manualInputs.t4} onChange={e => handleManualEntryChange('t4', e.target.value)} onBlur={() => handleManualEntryBlur('thyroidPanel', 't4')} />) }
                </div>
            </div>
        </div>

        {/* Renal & Electrolytes */}
        <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-md border p-2 space-y-2">
                <div className="flex items-center gap-3"> <RefreshCw className="h-5 w-5 text-primary/80" /> <p className="font-semibold">Renal Panel</p> </div>
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="rounded-md bg-muted/50 p-2"> <Label htmlFor="egfr-manual" className="font-semibold">eGFR</Label> {extractedData.renalPanel?.egfr ? (<p>{extractedData.renalPanel.egfr}</p>) : (<Input id="egfr-manual" type="number" className="h-7 mt-1 text-center" value={manualInputs.egfr} onChange={e => handleManualEntryChange('egfr', e.target.value)} onBlur={() => handleManualEntryBlur('renalPanel', 'egfr')} />) } </div>
                    <div className="rounded-md bg-muted/50 p-2"> <Label htmlFor="uacr-manual" className="font-semibold">UACR</Label> {extractedData.renalPanel?.uacr ? (<p>{extractedData.renalPanel.uacr}</p>) : (<Input id="uacr-manual" type="number" className="h-7 mt-1 text-center" value={manualInputs.uacr} onChange={e => handleManualEntryChange('uacr', e.target.value)} onBlur={() => handleManualEntryBlur('renalPanel', 'uacr')} />) } </div>
                </div>
            </div>
             <div className="rounded-md border p-2 space-y-2">
                <div className="flex items-center gap-3"> <Beaker className="h-5 w-5 text-primary/80" /> <p className="font-semibold">Electrolytes (mEq/L)</p> </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs">
                    <div className="rounded-md bg-muted/50 p-2"> <Label htmlFor="sodium-manual" className="font-semibold">Sodium</Label> {extractedData.electrolytes?.sodium ? (<p>{extractedData.electrolytes.sodium}</p>) : (<Input id="sodium-manual" type="number" className="h-7 mt-1 text-center" value={manualInputs.sodium} onChange={e => handleManualEntryChange('sodium', e.target.value)} onBlur={() => handleManualEntryBlur('electrolytes', 'sodium')} />) } </div>
                    <div className="rounded-md bg-muted/50 p-2"> <Label htmlFor="potassium-manual" className="font-semibold">Potassium</Label> {extractedData.electrolytes?.potassium ? (<p>{extractedData.electrolytes.potassium}</p>) : (<Input id="potassium-manual" type="number" className="h-7 mt-1 text-center" value={manualInputs.potassium} onChange={e => handleManualEntryChange('potassium', e.target.value)} onBlur={() => handleManualEntryBlur('electrolytes', 'potassium')} />) } </div>
                    <div className="rounded-md bg-muted/50 p-2"> <Label htmlFor="chloride-manual" className="font-semibold">Chloride</Label> {extractedData.electrolytes?.chloride ? (<p>{extractedData.electrolytes.chloride}</p>) : (<Input id="chloride-manual" type="number" className="h-7 mt-1 text-center" value={manualInputs.chloride} onChange={e => handleManualEntryChange('chloride', e.target.value)} onBlur={() => handleManualEntryBlur('electrolytes', 'chloride')} />) } </div>
                    <div className="rounded-md bg-muted/50 p-2"> <Label htmlFor="bicarbonate-manual" className="font-semibold">Bicarb</Label> {extractedData.electrolytes?.bicarbonate ? (<p>{extractedData.electrolytes.bicarbonate}</p>) : (<Input id="bicarbonate-manual" type="number" className="h-7 mt-1 text-center" value={manualInputs.bicarbonate} onChange={e => handleManualEntryChange('bicarbonate', e.target.value)} onBlur={() => handleManualEntryBlur('electrolytes', 'bicarbonate')} />) } </div>
                </div>
            </div>
        </div>

         {/* Mineral/Bone, Anemia, Nutrition */}
         <div className="grid md:grid-cols-2 gap-4">
             <div className="rounded-md border p-2 space-y-2">
                <div className="flex items-center gap-3"> <Bone className="h-5 w-5 text-primary/80" /> <p className="font-semibold">Mineral & Bone</p> </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-md bg-muted/50 p-2"> <Label htmlFor="calcium-manual" className="font-semibold">Calcium</Label> {extractedData.mineralBone?.calcium ? (<p>{extractedData.mineralBone.calcium}</p>) : (<Input id="calcium-manual" type="number" className="h-7 mt-1 text-center" value={manualInputs.calcium} onChange={e => handleManualEntryChange('calcium', e.target.value)} onBlur={() => handleManualEntryBlur('mineralBone', 'calcium')} />) } </div>
                    <div className="rounded-md bg-muted/50 p-2"> <Label htmlFor="phosphorus-manual" className="font-semibold">Phosphorus</Label> {extractedData.mineralBone?.phosphorus ? (<p>{extractedData.mineralBone.phosphorus}</p>) : (<Input id="phosphorus-manual" type="number" className="h-7 mt-1 text-center" value={manualInputs.phosphorus} onChange={e => handleManualEntryChange('phosphorus', e.target.value)} onBlur={() => handleManualEntryBlur('mineralBone', 'phosphorus')} />) } </div>
                    <div className="rounded-md bg-muted/50 p-2"> <Label htmlFor="pth-manual" className="font-semibold">PTH</Label> {extractedData.mineralBone?.pth ? (<p>{extractedData.mineralBone.pth}</p>) : (<Input id="pth-manual" type="number" className="h-7 mt-1 text-center" value={manualInputs.pth} onChange={e => handleManualEntryChange('pth', e.target.value)} onBlur={() => handleManualEntryBlur('mineralBone', 'pth')} />) } </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <div className="rounded-md border p-2 space-y-2">
                    <div className="flex items-center gap-3"> <HeartCrack className="h-5 w-5 text-primary/80" /> <p className="font-semibold">Anemia</p> </div>
                     <div className="rounded-md bg-muted/50 p-2 text-center text-xs"> <Label htmlFor="hemoglobin-manual" className="font-semibold">Hemoglobin</Label> {extractedData.hemoglobin ? (<p>{extractedData.hemoglobin}</p>) : (<Input id="hemoglobin-manual" type="number" className="h-7 mt-1 text-center" value={manualInputs.hemoglobin} onChange={e => handleManualEntryChange('hemoglobin', e.target.value)} onBlur={() => handleManualEntryBlur('hemoglobin')} />) } </div>
                </div>
                 <div className="rounded-md border p-2 space-y-2">
                    <div className="flex items-center gap-3"> <FlaskConical className="h-5 w-5 text-primary/80" /> <p className="font-semibold">Nutrition</p> </div>
                    <div className="rounded-md bg-muted/50 p-2 text-center text-xs"> <Label htmlFor="albumin-manual" className="font-semibold">Albumin</Label> {extractedData.albumin ? (<p>{extractedData.albumin}</p>) : (<Input id="albumin-manual" type="number" className="h-7 mt-1 text-center" value={manualInputs.albumin} onChange={e => handleManualEntryChange('albumin', e.target.value)} onBlur={() => handleManualEntryBlur('albumin')} />) } </div>
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
