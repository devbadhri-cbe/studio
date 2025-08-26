
'use client';

import { UserCircle, Mail, Phone, VenetianMask, Globe, Stethoscope, Pill, PlusCircle, Trash2, Loader2 } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/context/app-context';
import { calculateAge } from '@/lib/utils';
import { countries } from '@/lib/countries';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { suggestIcdCode } from '@/ai/flows/suggest-icd-code';

const MedicationSchema = z.object({
  name: z.string().min(2, 'Medication name is required.'),
  dosage: z.string().min(1, 'Dosage is required.'),
  frequency: z.string().min(1, 'Frequency is required.'),
});

function MedicationForm({ onSave, onCancel }: { onSave: (data: z.infer<typeof MedicationSchema>) => void, onCancel: () => void }) {
  const form = useForm<z.infer<typeof MedicationSchema>>({
    resolver: zodResolver(MedicationSchema),
    defaultValues: { name: '', dosage: '', frequency: '' },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="mt-2 space-y-2 rounded-lg border bg-muted/50 p-2">
        <div className="grid grid-cols-3 gap-2">
          <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormControl><Input placeholder="Name" {...field} /></FormControl><FormMessage /></FormItem> )} />
          <FormField control={form.control} name="dosage" render={({ field }) => ( <FormItem><FormControl><Input placeholder="Dosage" {...field} /></FormControl><FormMessage /></FormItem> )} />
          <FormField control={form.control} name="frequency" render={({ field }) => ( <FormItem><FormControl><Input placeholder="Frequency" {...field} /></FormControl><FormMessage /></FormItem> )} />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button type="submit" size="sm">Save</Button>
        </div>
      </form>
    </Form>
  );
}


const ConditionSchema = z.object({
  condition: z.string().min(2, 'Condition name is required.'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'A valid date is required.' }),
});

function MedicalConditionForm({ onSave, onCancel }: { onSave: (data: z.infer<typeof ConditionSchema>, icdCode?: string) => Promise<void>, onCancel: () => void }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof ConditionSchema>>({
    resolver: zodResolver(ConditionSchema),
    defaultValues: { condition: '', date: format(new Date(), 'yyyy-MM-dd') },
  });
  
  const handleSubmit = async (data: z.infer<typeof ConditionSchema>) => {
    setIsSubmitting(true);
    try {
      const { icdCode, description } = await suggestIcdCode({ condition: data.condition });
      await onSave(data, `${icdCode}: ${description}`);
       toast({
        title: 'Condition Added',
        description: `Suggested ICD-10 code: ${icdCode}`,
      });
    } catch (error) {
       console.error('Failed to get ICD code suggestion', error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Could not get ICD code suggestion. The condition will be added without it.',
      });
      await onSave(data);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="mt-2 space-y-2 rounded-lg border bg-muted/50 p-2">
        <FormField control={form.control} name="condition" render={({ field }) => ( <FormItem><FormControl><Input placeholder="Condition Name" {...field} /></FormControl><FormMessage /></FormItem> )}/>
        <FormField control={form.control} name="date" render={({ field }) => ( <FormItem><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )}/>
        <div className="flex justify-end gap-2">
          <Button type="button" size="sm" variant="ghost" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" size="sm" disabled={isSubmitting}>
             {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  );
}


export function ProfileCard() {
  const { profile, addMedicalCondition, removeMedicalCondition, addMedication, removeMedication } = useApp();
  const [isAddingCondition, setIsAddingCondition] = React.useState(false);
  const [isAddingMedication, setIsAddingMedication] = React.useState(false);

  const calculatedAge = calculateAge(profile.dob);
  const countryName = countries.find(c => c.code === profile.country)?.name || profile.country;
  
  const handleSaveCondition = async (data: z.infer<typeof ConditionSchema>, icdCode?: string) => {
    addMedicalCondition({ ...data, date: new Date(data.date).toISOString(), icdCode });
    setIsAddingCondition(false);
  };
  
  const handleSaveMedication = (data: z.infer<typeof MedicationSchema>) => {
    addMedication(data);
    setIsAddingMedication(false);
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <UserCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>Your personal and medical information.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="space-y-2 rounded-lg border bg-card p-4">
            <div className="flex items-center gap-3">
                <UserCircle className="h-5 w-5 shrink-0 text-muted-foreground" />
                <p className="font-semibold text-lg">{profile.name || 'N/A'}</p>
            </div>
             <div className="flex items-center gap-3 text-muted-foreground">
                <VenetianMask className="h-5 w-5 shrink-0" />
                <p>
                    {calculatedAge !== null ? `${calculatedAge} years` : 'N/A'}, <span className="capitalize">{profile.gender || 'N/A'}</span>
                </p>
            </div>
             <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-5 w-5 shrink-0" />
                <p>{profile.email || 'N/A'}</p>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-5 w-5 shrink-0" />
                <p>{profile.phone || 'N/A'}</p>
            </div>
             <div className="flex items-center gap-3 text-muted-foreground">
                <Globe className="h-5 w-5 shrink-0" />
                <p>{countryName}</p>
            </div>
        </div>
        
        <div>
            <div className="flex items-center justify-between gap-3 mb-2">
                <div className='flex items-center gap-3'>
                    <Stethoscope className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <h3 className="font-medium">Present Medical Conditions</h3>
                </div>
                 {!isAddingCondition && (
                    <Button size="xs" variant="outline" className="h-6 px-2" onClick={() => setIsAddingCondition(true)}>
                        <PlusCircle className="h-3.5 w-3.5 mr-1" /> Add
                    </Button>
                )}
            </div>
             {isAddingCondition && <MedicalConditionForm onSave={handleSaveCondition} onCancel={() => setIsAddingCondition(false)} />}
            {profile.presentMedicalConditions.length > 0 ? (
                <ul className="space-y-1 mt-2">
                    {profile.presentMedicalConditions.map((condition) => (
                        <li key={condition.id} className="group flex items-start gap-2 text-xs text-muted-foreground border-l-2 border-primary pl-3 pr-2 py-1 hover:bg-muted/50 rounded-r-md">
                            <div className="flex-1">
                                <span className="font-semibold text-foreground">{condition.condition}</span>
                                {condition.icdCode && <span className='block text-xs'>ICD-10: {condition.icdCode}</span>}
                                <span className="block text-xs">Diagnosed: {format(new Date(condition.date), 'dd-MMM-yyyy')}</span>
                            </div>
                            <Button size="icon" variant="ghost" className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100" onClick={() => removeMedicalCondition(condition.id)}>
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                        </li>
                    ))}
                </ul>
            ) : (
                !isAddingCondition && <p className="text-xs text-muted-foreground pl-8">No conditions recorded.</p>
            )}
        </div>

        <div>
            <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                    <Pill className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <h3 className="font-medium">Current Medication</h3>
                </div>
                {!isAddingMedication && (
                    <Button size="xs" variant="outline" className="h-6 px-2" onClick={() => setIsAddingMedication(true)}>
                        <PlusCircle className="h-3.5 w-3.5 mr-1" /> Add
                    </Button>
                )}
            </div>
             {isAddingMedication && <MedicationForm onSave={handleSaveMedication} onCancel={() => setIsAddingMedication(false)} />}
            {profile.medication.length > 0 ? (
                <ul className="space-y-1 mt-2">
                    {profile.medication.map((med) => (
                         <li key={med.id} className="group flex items-center gap-2 text-xs text-muted-foreground border-l-2 border-primary pl-3 pr-2 py-1 hover:bg-muted/50 rounded-r-md">
                            <div className='flex-1'>
                                <span className="font-semibold text-foreground">{med.name}</span>
                                <span className='block'>({med.dosage}, {med.frequency})</span>
                            </div>
                             <Button size="icon" variant="ghost" className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100" onClick={() => removeMedication(med.id)}>
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                        </li>
                    ))}
                </ul>
            ) : (
                 !isAddingMedication && <p className="text-xs text-muted-foreground pl-8">No medication recorded.</p>
            )}
        </div>

      </CardContent>
    </Card>
  );
}

    