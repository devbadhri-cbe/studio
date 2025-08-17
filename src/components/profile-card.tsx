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

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  dob: z.string().refine((dob) => new Date(dob).toString() !== 'Invalid Date' && new Date(dob) < new Date(), {
    message: 'Please enter a valid date of birth.',
  }),
  medication: z.string().optional(),
});

export function ProfileCard() {
  const { profile, setProfile } = useApp();
  const [isSaving, setIsSaving] = React.useState(false);
  const { toast } = useToast();
  const age = calculateAge(profile.dob);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    values: {
      name: profile.name,
      dob: profile.dob,
      medication: profile.medication,
    },
  });

  const onSubmit = (data: z.infer<typeof profileSchema>) => {
    setIsSaving(true);
    setProfile(data);
    setTimeout(() => {
      toast({
        title: 'Profile Updated!',
        description: 'Your information has been saved successfully.',
      });
      setIsSaving(false);
    }, 500);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <UserCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>My Profile {age && `(${age} years)`}</CardTitle>
            <CardDescription>Keep your personal information up to date.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Jane Doe" {...field} />
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
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="medication"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medication</FormLabel>
                  <FormControl>
                    <Textarea placeholder="List any relevant medications..." className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSaving} className="w-full">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
