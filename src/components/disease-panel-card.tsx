
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
import { Settings, PlusCircle } from 'lucide-react';
import { availableBiomarkerCards, type BiomarkerKey, DiseasePanelKey } from '@/lib/biomarker-cards';
import { useApp } from '@/context/app-context';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Checkbox } from './ui/checkbox';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from './ui/form';
import { DatePicker } from './ui/date-picker';
import { Input } from './ui/input';
import { startOfDay } from 'date-fns';
import { ActionMenu } from './ui/action-menu';
import { Separator } from './ui/separator';

const biomarkerFieldsConfig: { [key: string]: any } = {
  hba1c: { label: 'HbA1c (%)', type: 'number', step: '0.1', placeholder: 'e.g., 5.7', unit: '%' },
  glucose: { label: 'Fasting Glucose', type: 'number', placeholder: 'e.g., 95', unit: 'mg/dL' },
  hemoglobin: { label: 'Hemoglobin', type: 'number', step: '0.1', placeholder: 'e.g., 13.5', unit: 'g/dL' },
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
  thyroxine: { label: 'Thyroxine (T4)', type: 'number', step: '0.1', placeholder: 'e.g., 8.0', unit: 'ng/dL' },
  serumCreatinine: { label: 'Serum Creatinine', type: 'number', step: '0.01', placeholder: 'e.g., 0.9', unit: 'mg/dL' },
  uricAcid: { label: 'Uric Acid', type: 'number', step: '0.1', placeholder: 'e.g., 6.5', unit: 'mg/dL' },
};


interface AddPanelRecordDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    enabledBiomarkers: (BiomarkerKey | string)[];
    panelKey: DiseasePanelKey;
    form: ReturnType<typeof useForm>;
}

function AddPanelRecordDialog({ open, onOpenChange, enabledBiomarkers, panelKey, form }: AddPanelRecordDialogProps) {
    const { addHba1cRecord, addFastingBloodGlucoseRecord, addHemoglobinRecord, addBloodPressureRecord, addWeightRecord, addThyroidRecord, addLipidRecord, profile, getDbGlucoseValue, getDbHemoglobinValue, biomarkerUnit, addSerumCreatinineRecord, addUricAcidRecord, addThyroxineRecord, addTotalCholesterolRecord, addLdlRecord, addHdlRecord, addTriglyceridesRecord } = useApp();
    
    const isImperial = profile.unitSystem === 'imperial';
    
    const handleCancel = () => {
        onOpenChange(false);
        // Defer form reset to avoid race condition with dialog closing animation
        requestAnimationFrame(() => {
            const defaultFormValues: { [key: string]: any } = { date: new Date() };
            Object.keys(biomarkerFieldsConfig).forEach(key => {
                const config = biomarkerFieldsConfig[key as keyof typeof biomarkerFieldsConfig];
                if (config.fields) {
                    Object.keys(config.fields).forEach(subKey => {
                        defaultFormValues[subKey] = '';
                    });
                } else {
                    defaultFormValues[key] = '';
                }
            });
            form.reset(defaultFormValues);
        });
    }

    const onSubmit = (data: any) => {
        let recordsAdded = 0;
        const recordDate = data.date ? startOfDay(data.date).toISOString() : new Date().toISOString();

        Object.keys(data).forEach(key => {
            if (key !== 'date' && (data[key] !== '' && data[key] !== undefined && data[key] !== null)) {
                switch(key) {
                    case 'hba1c': 
                        addHba1cRecord({ date: recordDate, value: Number(data.hba1c) });
                        recordsAdded++;
                        break;
                    case 'glucose':
                        addFastingBloodGlucoseRecord({ date: recordDate, value: getDbGlucoseValue(Number(data.glucose)) });
                        recordsAdded++;
                        break;
                    case 'hemoglobin':
                        addHemoglobinRecord({ date: recordDate, hemoglobin: getDbHemoglobinValue(Number(data.hemoglobin)) });
                        recordsAdded++;
                        break;
                    case 'systolic': // Part of blood pressure
                    case 'diastolic':
                        if (data.systolic && data.diastolic) {
                            addBloodPressureRecord({ date: recordDate, systolic: Number(data.systolic), diastolic: Number(data.diastolic), heartRate: data.heartRate ? Number(data.heartRate) : undefined });
                            recordsAdded++;
                            // prevent double counting
                            data.diastolic = ''; 
                        }
                        break;
                    case 'weight':
                        addWeightRecord({ date: recordDate, value: Number(data.weight) });
                        recordsAdded++;
                        break;
                    case 'tsh': // Part of thyroid
                    case 't3':
                    case 't4':
                         if (data.tsh || data.t3 || data.t4) {
                            addThyroidRecord({ date: recordDate, tsh: Number(data.tsh || 0), t3: Number(data.t3 || 0), t4: Number(data.t4 || 0) });
                            recordsAdded++;
                            data.t3 = ''; data.t4 = ''; // prevent double counting
                         }
                        break;
                    case 'totalCholesterol':
                    case 'ldl':
                    case 'hdl':
                    case 'triglycerides':
                        if (data.totalCholesterol) addTotalCholesterolRecord({ date: recordDate, value: Number(data.totalCholesterol) });
                        if (data.ldl) addLdlRecord({ date: recordDate, value: Number(data.ldl) });
                        if (data.hdl) addHdlRecord({ date: recordDate, value: Number(data.hdl) });
                        if (data.triglycerides) addTriglyceridesRecord({ date: recordDate, value: Number(data.triglycerides) });
                        
                        if (data.totalCholesterol || data.ldl || data.hdl || data.triglycerides) {
                            recordsAdded++;
                            data.ldl = ''; data.hdl = ''; data.triglycerides = ''; // prevent double counting
                        }
                        break;
                    case 'serumCreatinine':
                        addSerumCreatinineRecord({ date: recordDate, value: Number(data.serumCreatinine) });
                        recordsAdded++;
                        break;
                    case 'uricAcid':
                        addUricAcidRecord({ date: recordDate, value: Number(data.uricAcid) });
                        recordsAdded++;
                        break;
                    case 'thyroxine':
                        addThyroxineRecord({ date: recordDate, value: Number(data.thyroxine) });
                        recordsAdded++;
                        break;
                }
            }
        });
        
        toast({
            title: "Records Saved",
            description: `${recordsAdded} new record(s) have been successfully added.`
        })
        onOpenChange(false);
    };

    const renderField = (key: BiomarkerKey | string) => {
      const config = biomarkerFieldsConfig[key as keyof typeof biomarkerFieldsConfig];
      if (!config) return null;

      if ('fields' in config) {
          // Nested fields like Blood Pressure or Thyroid
          return (
              <div key={key}>
                  <Label className="font-semibold">{config.label}</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 border p-3 rounded-md mt-1">
                      {Object.entries(config.fields).map(([subKey, subConfig]: [string, any]) => (
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
                            <div className="space-y-4 py-4 px-2 md:px-6">
                                <FormField
                                    control={form.control}
                                    name="date"
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
                        <DialogFooter className="pt-4 px-6 pb-6">
                           <Button type="button" variant="ghost" onClick={handleCancel}>Cancel</Button>
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

  const form = useForm({
      defaultValues: React.useMemo(() => {
        const defaults: { [key: string]: any } = { date: new Date() };
        Object.keys(biomarkerFieldsConfig).forEach(key => {
            const config = biomarkerFieldsConfig[key as keyof typeof biomarkerFieldsConfig];
            if (config.fields) {
                Object.keys(config.fields).forEach(subKey => {
                    defaults[subKey] = '';
                });
            } else {
                defaults[key] = '';
            }
        });
        return defaults;
      }, []),
  });

  const enabledForPanel = profile.enabledBiomarkers?.[panelKey] || [];
  const isPanelEnabledForPatient = profile.enabledBiomarkers?.hasOwnProperty(panelKey);
  
  const handlePanelToggle = (checked: boolean) => {
    toggleDiseasePanel(panelKey);
  }
  
  const handleOpenAddRecordDialog = () => {
    const defaultFormValues: { [key: string]: any } = { date: new Date() };
    Object.keys(biomarkerFieldsConfig).forEach(key => {
        const config = biomarkerFieldsConfig[key as keyof typeof biomarkerFieldsConfig];
        if (config.fields) {
            Object.keys(config.fields).forEach(subKey => {
                defaultFormValues[subKey] = '';
            });
        } else {
            defaultFormValues[key] = '';
        }
    });
    form.reset(defaultFormValues);
    setIsAddRecordOpen(true);
  }

  const childrenWithReadOnly = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
        return React.cloneElement(child as React.ReactElement<any>, { isReadOnly: true, className: 'biomarker-emboss' });
    }
    return child;
  });

  const sortedBiomarkers = React.useMemo(() => {
    const enabled = allPanelBiomarkers
      .filter(key => enabledForPanel.includes(key))
      .map(key => ({ key, ...availableBiomarkerCards[key as BiomarkerKey] }))
      .sort((a, b) => a.label.localeCompare(b.label));

    const disabled = allPanelBiomarkers
      .filter(key => !enabledForPanel.includes(key))
      .map(key => ({ key, ...availableBiomarkerCards[key as BiomarkerKey] }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return { enabled, disabled };
  }, [allPanelBiomarkers, enabledForPanel]);


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
            
            {isDoctorLoggedIn && (
                <ActionMenu
                    tooltip="Settings"
                    icon={<Settings className="h-4 w-4" />}
                >
                    <DropdownMenuItem onSelect={handleOpenAddRecordDialog} disabled={!isPanelEnabledForPatient || enabledForPanel.length === 0}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Panel Records
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Manage Biomarkers</DropdownMenuLabel>
                    <ScrollArea className="h-[200px]">
                        <div className="p-1">
                             {sortedBiomarkers.enabled.map((biomarkerInfo) => (
                                <DropdownMenuItem key={biomarkerInfo.key} onSelect={(e) => e.preventDefault()}>
                                    <Label htmlFor={`switch-${panelKey}-${biomarkerInfo.key}`} className="flex items-center justify-between w-full cursor-pointer px-2 py-1.5 font-normal">
                                        <span>{biomarkerInfo.label}</span>
                                        <Switch
                                            id={`switch-${panelKey}-${biomarkerInfo.key}`}
                                            checked={true}
                                            onCheckedChange={() => toggleDiseaseBiomarker(panelKey, biomarkerInfo.key)}
                                        />
                                    </Label>
                                </DropdownMenuItem>
                            ))}

                            {sortedBiomarkers.enabled.length > 0 && sortedBiomarkers.disabled.length > 0 && <Separator className="my-1" />}

                            {sortedBiomarkers.disabled.map((biomarkerInfo) => (
                                <DropdownMenuItem key={biomarkerInfo.key} onSelect={(e) => e.preventDefault()}>
                                    <Label htmlFor={`switch-${panelKey}-${biomarkerInfo.key}`} className="flex items-center justify-between w-full cursor-pointer px-2 py-1.5 font-normal">
                                        <span>{biomarkerInfo.label}</span>
                                        <Switch
                                            id={`switch-${panelKey}-${biomarkerInfo.key}`}
                                            checked={false}
                                            onCheckedChange={() => toggleDiseaseBiomarker(panelKey, biomarkerInfo.key)}
                                        />
                                    </Label>
                                </DropdownMenuItem>
                            ))}
                        </div>
                    </ScrollArea>
                </ActionMenu>
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
        form={form}
    />
    </>
  );
}

