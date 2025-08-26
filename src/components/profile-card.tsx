
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, UserCircle, PlusCircle, Trash2 } from 'lucide-react';
import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { calculateAge } from '@/lib/utils';
import { FormDescription } from './ui/form';
import { MedicalConditionsList } from './medical-conditions-list';
import { Separator } from './ui/separator';

const profileSchema = z.object({
  name: z.string(),
  dob: z.string(),
  medication: z.array(
    z.object({
      name: z.string().min(1, 'Medicine name is required.'),
      dosage: z.string().min(1, 'Dosage is required.'),
      frequency: z.string().min(1, 'Frequency is required.'),
    })
  ),
});

export function ProfileCard() {
  const { profile, setProfile } = useApp();
  const [isSaving, setIsSaving] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    values: {
      name: profile.name,
      dob: profile.dob,
      medication: Array.isArray(profile.medication) ? profile.medication.map(({id, ...rest}) => rest) : [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'medication',
  });

  React.useEffect(() => {
    form.reset({
      name: profile.name,
      dob: profile.dob,
      medication: Array.isArray(profile.medication) ? profile.medication.map(({id, ...rest}) => rest) : [],
    });
  }, [profile, form]);

  const onSubmit = (data: z.infer<typeof profileSchema>) => {
    setIsSaving(true);
    const updatedMedication = data.medication.map((med, index) => ({
        id: (profile.medication && profile.medication[index]?.id) || Date.now().toString() + index,
        ...med
    }));
    setProfile({
      ...profile,
      medication: updatedMedication,
    });
    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Medication Updated!',
        description: 'Your medication information has been saved.',
      });
      setIsSaving(false);
    }, 500);
  };
  
  const dobValue = form.watch('dob');
  const calculatedAge = calculateAge(dobValue);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <UserCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>Keep your personal information up to date.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Jane Doe" {...field} readOnly className="cursor-default bg-muted/50"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} readOnly className="cursor-default bg-muted/50"/>
                  </FormControl>
                  {calculatedAge !== null && <FormDescription>Your age is {calculatedAge} years.</FormDescription>}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator />
            
            <div>
              <h3 className="font-medium">Current Medication</h3>
              <p className="text-sm text-muted-foreground">Manage your list of medications.</p>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-3 rounded-md border p-3 relative">
                  <span className="font-medium text-muted-foreground mt-9">{index + 1}.</span>
                   <Button 
                      type="button"
                      variant="ghost" 
                      size="icon" 
                      className="absolute -top-3 -right-3 h-6 w-6 bg-destructive/20 text-destructive hover:bg-destructive/30"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-1">
                    <FormField
                      control={form.control}
                      name={`medication.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medicine</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Metformin" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`medication.${index}.dosage`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dosage</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 500mg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name={`medication.${index}.frequency`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Twice a day" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>

             <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => append({ name: '', dosage: '', frequency: '' })}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Medication
            </Button>


            <Button type="submit" disabled={isSaving} className="w-full">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Medication...
                </>
              ) : (
                'Save Medication'
              )}
            </Button>
          </form>
        </Form>
        <MedicalConditionsList />
      </CardContent>
    </Card>
  );
}
