
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { Settings, PlusCircle, Calendar as CalendarIcon, Droplet, Heart, Activity, Flame, Weight, XCircle } from 'lucide-react';
import { availableBiomarkerCards, type BiomarkerKey, DiseasePanelKey } from '@/lib/biomarker-cards';
import { useApp } from '@/context/app-context';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Checkbox } from './ui/checkbox';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { DatePicker } from './ui/date-picker';
import { Input } from './ui/input';
import { startOfDay } from 'date-fns';

const biomarkerFieldsConfig = {
  hba1c: { label: 'HbA1c (%)', type: 'number', step: '0.1', placeholder: 'e.g., 5.7', unit: '%' },
  glucose: { label: 'Fasting Glucose', type: 'number', unit: 'mg/dL' }, // Unit handled in label
  hemoglobin: { label: 'Hemoglobin', type: 'number', step: '0.1', unit: 'g/dL' }, // Unit handled in label
  bloodPressure: {
    label: 'Blood Pressure',
    fields: {
      systolic: { label: 'Systolic (mmHg)', type: 'number', placeholder: 'e.g., 120' },
      diastolic: { label: 'Diastolic (mmHg)', type: 'number', placeholder: 'e.g., 80' },
      heartRate: { label: 'Heart Rate (bpm)', type: 'number', placeholder: 'e.g., 70' },
    }
  },
  weight: { label: 'Weight', type: 'number', step: '0.1', unit: 'kg/lbs' }, // Unit handled in label
  totalCholesterol: { label: 'Total Cholesterol (mg/dL)', type: 'number', placeholder: 'e.g., 200' },
  ldl: { label: 'LDL Cholesterol (mg/dL)', type: 'number', placeholder: 'e.g., 100' },
  hdl: { label: 'HDL Cholesterol (mg/dL)', type: 'number', placeholder: 'e.g., 50' },
  triglycerides: { label: 'Triglycerides (mg/dL)', type: 'number', placeholder: 'e.g., 150' },
  thyroid: {
    label: 'Thyroid Panel',
    fields: {
      tsh: { label: 'TSH (μIU/mL)', type: 'number', step: '0.01', placeholder: 'e.g., 2.5' },
      t3: { label: 'T3 (pg/mL)', type: 'number', placeholder: 'e.g., 3.0' },
      t4: { label: 'T4 (ng/dL)', type: 'number', step: '0.1', placeholder: 'e.g., 1.2' },
    }
  },
  vitaminD: { label: 'Vitamin D', type: 'number', unit: 'ng/mL or nmol/L' }, // Unit handled in label
};


interface AddPanelRecordDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    enabledBiomarkers: (BiomarkerKey | string)[];
    panelKey: DiseasePanelKey;
}

function AddPanelRecordDialog({ open, onOpenChange, enabledBiomarkers, panelKey }: AddPanelRecordDialogProps) {
    const { addHba1cRecord, addFastingBloodGlucoseRecord, addHemoglobinRecord, addBloodPressureRecord, addWeightRecord, addThyroidRecord, addLipidRecord, profile, getDbGlucoseValue, getDbHemoglobinValue, biomarkerUnit } = useApp();
    
    const isImperial = profile.unitSystem === 'imperial';

    const form = useForm();
    
    const onSubmit = (data: any) => {
        let recordsAdded = 0;
        const recordDate = data.date ? startOfDay(data.date).toISOString() : new Date().toISOString();

        if (data.hba1c) {
            addHba1cRecord({ date: recordDate, value: Number(data.hba1c) });
            recordsAdded++;
        }
        if (data.glucose) {
            addFastingBloodGlucoseRecord({ date: recordDate, value: getDbGlucoseValue(Number(data.glucose)) });
            recordsAdded++;
        }
        if (data.hemoglobin) {
            addHemoglobinRecord({ date: recordDate, hemoglobin: getDbHemoglobinValue(Number(data.hemoglobin)) });
            recordsAdded++;
        }
        if (data.systolic && data.diastolic) {
            addBloodPressureRecord({ date: recordDate, systolic: Number(data.systolic), diastolic: Number(data.diastolic), heartRate: data.heartRate ? Number(data.heartRate) : undefined });
            recordsAdded++;
        }
        if (data.weight) {
            addWeightRecord({ date: recordDate, value: Number(data.weight) });
            recordsAdded++;
        }
        if (data.tsh || data.t3 || data.t4) {
            addThyroidRecord({ date: recordDate, tsh: Number(data.tsh || 0), t3: Number(data.t3 || 0), t4: Number(data.t4 || 0) });
            recordsAdded++;
        }
        if (data.totalCholesterol || data.ldl || data.hdl || data.triglycerides) {
            addLipidRecord({ date: recordDate, totalCholesterol: Number(data.totalCholesterol || 0), ldl: Number(data.ldl || 0), hdl: Number(data.hdl || 0), triglycerides: Number(data.triglycerides || 0) });
            recordsAdded++;
        }
        
        toast({
            title: "Records Saved",
            description: `${recordsAdded} new record(s) have been successfully added.`
        })
        onOpenChange(false);
    };

    React.useEffect(() => {
        if (open) {
            form.reset();
        }
    }, [open, form]);

    const renderField = (key: BiomarkerKey | string) => {
      const config = biomarkerFieldsConfig[key as keyof typeof biomarkerFieldsConfig];
      if (!config) return null;

      if ('fields' in config) {
          // Nested fields like Blood Pressure or Thyroid
          return (
              <div key={key}>
                  <Label className="font-semibold">{config.label}</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 border p-3 rounded-md mt-1">
                      {Object.entries(config.fields).map(([subKey, subConfig]) => (
                          <FormField
                              key={subKey}
                              control={form.control}
                              name={subKey}
                              render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>{subConfig.label}</FormLabel>
                                      <FormControl>
                                          <Input type={subConfig.type} step={subConfig.step} placeholder={subConfig.placeholder} {...field} />
                                      </FormControl>
                                  </FormItem>
                              )}
                          />
                      ))}
                  </div>
              </div>
          );
      }
      
      let fieldLabel = config.label;
      if (key === 'glucose') fieldLabel = `Fasting Glucose (${biomarkerUnit === 'si' ? 'mmol/L' : 'mg/dL'})`;
      if (key === 'hemoglobin') fieldLabel = `Hemoglobin (${biomarkerUnit === 'si' ? 'g/L' : 'g/dL'})`;
      if (key === 'weight') fieldLabel = `Weight (${isImperial ? 'lbs' : 'kg'})`;

      return (
        <FormField
            key={key}
            control={form.control}
            name={key}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{fieldLabel}</FormLabel>
                    <FormControl>
                        <Input type={config.type} step={config.step} placeholder={config.placeholder} {...field} />
                    </FormControl>
                </FormItem>
            )}
        />
      )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add New Panel Records</DialogTitle>
                    <DialogDescription>
                        Enter any available results for this panel. Fields left blank will be ignored.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <ScrollArea className="h-96 w-full">
                            <div className="space-y-4 py-4 pr-6">
                                <FormField
                                    control={form.control}
                                    name="date"
                                    defaultValue={new Date()}
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Test Date</FormLabel>
                                            <FormControl>
                                                <DatePicker
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {enabledBiomarkers.map(renderField)}
                            </div>
                        </ScrollArea>
                        <DialogFooter className="pt-4">
                           <DialogClose asChild>
                              <Button type="button" variant="ghost">Cancel</Button>
                           </DialogClose>
                            <Button type="submit">Save Records</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

interface DiseasePanelCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  panelKey: DiseasePanelKey;
  allPanelBiomarkers: (BiomarkerKey | string)[];
}

export function DiseasePanelCard({
  title,
  icon,
  children,
  className,
  panelKey,
  allPanelBiomarkers,
}: DiseasePanelCardProps) {
  const { profile, toggleDiseaseBiomarker, toggleDiseasePanel, isDoctorLoggedIn } = useApp();
  const [isAddRecordOpen, setIsAddRecordOpen] = React.useState(false);

  const enabledForPanel = profile.enabledBiomarkers?.[panelKey] || [];
  const isPanelEnabledForPatient = profile.enabledBiomarkers?.hasOwnProperty(panelKey);
  
  const handlePanelToggle = (checked: boolean) => {
    toggleDiseasePanel(panelKey);
  }
  
  const sortedBiomarkerKeys = React.useMemo(() => {
    return Object.keys(availableBiomarkerCards).sort((a, b) => {
      const aIsEnabled = enabledForPanel.includes(a);
      const bIsEnabled = enabledForPanel.includes(b);
      const aInfo = availableBiomarkerCards[a as BiomarkerKey];
      const bInfo = availableBiomarkerCards[b as BiomarkerKey];
      
      if (aIsEnabled && !bIsEnabled) return -1;
      if (!aIsEnabled && bIsEnabled) return 1;
      
      return aInfo.label.localeCompare(bInfo.label);
    });
  }, [enabledForPanel]);

  const childrenWithReadOnly = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
        return React.cloneElement(child as React.ReactElement<any>, { isReadOnly: true });
    }
    return child;
  });

  return (
    <>
    <Card className={cn("w-full flex flex-col h-full shadow-md border-2", isPanelEnabledForPatient ? "border-primary/20" : "border-dashed", className)}>
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          {icon}
          <CardTitle>{title}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
            {isDoctorLoggedIn && (
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id={`enable-panel-${panelKey}`}
                        checked={isPanelEnabledForPatient}
                        onCheckedChange={handlePanelToggle}
                    />
                </div>
            )}
            <Button size="icon" variant="ghost" className="h-8 w-8" disabled={!isPanelEnabledForPatient || enabledForPanel.length === 0} onClick={() => setIsAddRecordOpen(true)}>
                <PlusCircle className="h-4 w-4" />
            </Button>
            {isDoctorLoggedIn && (
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8" disabled={!isPanelEnabledForPatient}>
                        <Settings className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end">
                    <DropdownMenuLabel>Manage Biomarkers</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <ScrollArea className="h-[200px]">
                        <div className="p-1">
                            {allPanelBiomarkers.map((key) => {
                                const biomarkerInfo = availableBiomarkerCards[key as BiomarkerKey];
                                if (!biomarkerInfo) return null;

                                const isChecked = enabledForPanel.includes(key);

                                return (
                                    <DropdownMenuItem key={key} onSelect={(e) => e.preventDefault()} className="p-0">
                                        <Label htmlFor={`switch-${panelKey}-${key}`} className="flex items-center justify-between w-full cursor-pointer px-2 py-1.5">
                                            <span className="font-normal">{biomarkerInfo.label}</span>
                                            <Switch
                                                id={`switch-${panelKey}-${key}`}
                                                checked={isChecked}
                                                onCheckedChange={() => toggleDiseaseBiomarker(panelKey, key)}
                                            />
                                        </Label>
                                    </DropdownMenuItem>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4 pt-0">
        {isPanelEnabledForPatient ? (
          enabledForPanel.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-start">
              {childrenWithReadOnly}
            </div>
          ) : (
             <div className="flex-1 flex items-center justify-center text-center text-muted-foreground p-4 min-h-[200px] bg-muted/30 rounded-lg">
                <p className="text-sm">No biomarkers enabled for this panel. Enable them in the settings.</p>
            </div>
          )
        ) : (
          <div className="flex-1 flex items-center justify-center text-center text-muted-foreground p-4 min-h-[200px] bg-muted/30 rounded-lg">
            <p className="text-sm">This panel is currently disabled for the patient.</p>
          </div>
        )}
      </CardContent>
    </Card>
    <AddPanelRecordDialog 
        open={isAddRecordOpen}
        onOpenChange={setIsAddRecordOpen}
        enabledBiomarkers={enabledForPanel}
        panelKey={panelKey}
    />
    </>
  );
}
