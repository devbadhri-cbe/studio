
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { getPatient } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { addPatient } from '@/lib/firestore';
import { PatientForm, type PatientFormData } from '@/components/patient-form';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function PatientLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [patientId, setPatientId] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isMobile = useIsMobile();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      toast({ variant: 'destructive', title: 'Patient ID is required' });
      return;
    }
    setIsLoading(true);
    try {
      const patient = await getPatient(patientId);
      if (patient) {
        router.push(`/patient/${patientId}`);
      } else {
        toast({ variant: 'destructive', title: 'Invalid Patient ID', description: 'No patient found with that ID.' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not verify Patient ID.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (data: PatientFormData) => {
      setIsSubmitting(true);
      const patientData = {
          name: data.name,
          dob: data.dob.toISOString(),
          gender: data.gender,
          email: data.email || '',
          country: data.country,
          phone: data.phone || '',
      };

      try {
          const newPatient = await addPatient(patientData);
          toast({
              title: 'Profile Created',
              description: `Your patient profile has been created successfully.`,
          });
          router.push(`/patient/${newPatient.id}`);
      } catch (error) {
          console.error("Failed to save patient", error);
          toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Could not create your profile. Please try again.',
          });
      } finally {
          setIsSubmitting(false);
      }
  };

  if (isCreating) {
    const formContent = (
      <PatientForm 
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => setIsCreating(false)}
      />
    );
    if (isMobile) {
        return (
            <Sheet open={isCreating} onOpenChange={setIsCreating}>
                <SheetContent side="bottom" className="h-[90vh] p-0">
                    <SheetHeader className="p-6">
                        <SheetTitle>Create New Patient Profile</SheetTitle>
                        <SheetDescription>Enter your details to create a health dashboard.</SheetDescription>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(90vh-100px)]">
                        <div className="p-6 pt-0">{formContent}</div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>
        )
    }
    return (
       <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <Card className="w-full max-w-2xl">
              <CardHeader>
                  <CardTitle>Create New Patient Profile</CardTitle>
                  <CardDescription>Enter your details to create a health dashboard.</CardDescription>
              </CardHeader>
              <CardContent>
                  {formContent}
              </CardContent>
          </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Patient Dashboard Access</CardTitle>
          <CardDescription>Enter your Patient ID to view your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="patientId">Patient ID</Label>
              <Input
                id="patientId"
                type="text"
                placeholder="Enter your unique Patient ID"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Access Dashboard
            </Button>
          </form>
           <div className="mt-4 pt-4 border-t text-center text-sm">
            Don&apos;t have a profile?{' '}
            <Button variant="link" onClick={() => setIsCreating(true)}>
              Create one now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
