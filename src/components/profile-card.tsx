'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, UserCircle } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from './ui/textarea';
import { calculateAge } from '@/lib/utils';
import { FormDescription } from './ui/form';
import { MedicalConditionsList } from './medical-conditions-list';

const profileSchema = z.object({
  name: z.string(),
  dob: z.string(),
  medication: z.string().optional(),
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
      medication: profile.medication,
    },
  });

  React.useEffect(() => {
    form.reset({
      name: profile.name,
      dob: profile.dob,
      medication: profile.medication,
    });
  }, [profile, form]);

  const onSubmit = (data: z.infer<typeof profileSchema>) => {
    setIsSaving(true);
    // Only medication is updated by the patient. Name and DOB are read-only.
    setProfile({
      ...profile,
      medication: data.medication,
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
            
            <FormField
              control={form.control}
              name="medication"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Medication</FormLabel>
                  <FormControl>
                    <Textarea placeholder="List any relevant medications..." className="resize-none" {...field} />
                  </FormControl>
                  <FormDescription>You can update your current medication here. Click save when done.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
