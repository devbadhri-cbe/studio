
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getPatient, updatePatient } from '@/lib/firestore';
import { Separator } from '@/components/ui/separator';

const FormSchema = z.object({
  patientId: z.string().min(1, { message: 'Patient ID is required.' }),
});

export default function PatientLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      patientId: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true);
    try {
        const patient = await getPatient(data.patientId);
        if (patient) {
            localStorage.setItem('patient_id', patient.id);
            await updatePatient(patient.id, { lastLogin: new Date().toISOString() });
            toast({
                title: 'Login Successful',
                description: `Welcome, ${patient.name}! Redirecting to your dashboard...`,
            });
            router.push(`/patient/${patient.id}`);
        } else {
             toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: 'No patient found with that ID. Please check and try again.',
            });
            setIsSubmitting(false);
        }
    } catch (error) {
        console.error("Patient login error:", error);
         toast({
            variant: 'destructive',
            title: 'An Error Occurred',
            description: 'Could not verify patient ID. Please try again later.',
        });
        setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
           <div className="flex items-center justify-center gap-2 mb-4">
              <Logo className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold font-headline">Health Guardian</span>
            </div>
          <CardTitle className="text-2xl">Patient Portal</CardTitle>
          <CardDescription>Please enter your Patient ID to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your unique ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center text-xs">
            <Link href="/doctor/login" className="text-muted-foreground hover:text-primary">
                Are you a doctor? Log in here.
            </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
