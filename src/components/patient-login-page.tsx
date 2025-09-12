'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { UniversalCard } from '@/components/universal-card';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import { PatientForm, type PatientFormData } from '@/components/patient-form';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ftInToCm } from '@/lib/utils';
import { countries } from '@/lib/countries';
import { useApp } from '@/context/app-context';
import type { Patient } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

export function PatientLoginPage() {
  const { toast } = useToast();
  const { setPatient, isClient } = useApp();
  const [isCreating, setIsCreating] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [newPatientName, setNewPatientName] = React.useState('');
  const isMobile = useIsMobile();
  const [hasExistingData, setHasExistingData] = React.useState(false);

  React.useEffect(() => {
    if (isClient) {
      const localData = localStorage.getItem('patientData');
      setHasExistingData(!!localData);
    }
  }, [isClient]);
  
  const deleteProfile = () => {
    localStorage.removeItem('patientData');
    window.location.reload();
  };

  const handleCreateNewProfile = () => {
    setIsCreating(true);
  };

  const handleFormSubmit = (data: PatientFormData) => {
    setIsSubmitting(true);
    setNewPatientName(data.name);
    const countryInfo = countries.find(c => c.code === data.country);
    const isImperial = countryInfo?.unitSystem === 'imperial';
    
    let heightInCm: number | undefined;
    if (isImperial) {
        const ft = data.height_ft ? Number(data.height_ft) : 0;
        const inches = data.height_in ? Number(data.height_in) : 0;
        heightInCm = ft > 0 || inches > 0 ? ftInToCm(ft, inches) : undefined;
    } else {
        heightInCm = data.height ? Number(data.height) : undefined;
    }

    const newPatient: Patient = {
        id: uuidv4(),
        name: data.name,
        dob: data.dob.toISOString(),
        gender: data.gender,
        height: heightInCm,
        country: data.country,
        email: data.email || '',
        phone: data.phone || '',
        dateFormat: countryInfo?.dateFormat || 'MM-dd-yyyy',
        unitSystem: countryInfo?.unitSystem || 'metric',
        hba1cRecords: [],
        medication: [],
        presentMedicalConditions: [],
    };

    try {
        localStorage.setItem('patientData', JSON.stringify(newPatient));
        
        setIsSuccess(true);
        toast({
            title: 'Profile Created',
            description: `Your patient profile has been created successfully.`,
        });

        // Delay setting patient to allow success screen to show
        setTimeout(() => {
            setPatient(newPatient);
        }, 1500);
        
    } catch (error) {
        console.error("Failed to save patient", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not create your profile. Please try again.',
        });
        setIsSubmitting(false);
    }
  };
  
  if (isCreating || isSuccess) {
    const formContent = (
      isSuccess ? (
        <div className="flex flex-col items-center justify-center h-48 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h3 className="text-xl font-bold">Welcome, {newPatientName}!</h3>
            <p className="text-muted-foreground">Entering your health dashboard...</p>
        </div>
      ) : (
        <PatientForm 
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
            onCancel={() => setIsCreating(false)}
        />
      )
    );
    if (isMobile) {
        return (
            <Sheet open={isCreating} onOpenChange={(open) => { if (!open) setIsCreating(false); }}>
                <SheetContent side="bottom" className="h-[90vh] p-0 bg-background">
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
            <UniversalCard 
                title={isSuccess ? "Success" : "Create New Patient Profile"}
                description={isSuccess ? undefined : "Enter your details to create a health dashboard."}
                className="w-full max-w-2xl"
            >
                {formContent}
            </UniversalCard>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm text-center">
        <UniversalCard 
            icon={<Logo className="h-16 w-16 mx-auto" />}
            title="Health Guardian Lite"
            description="Your Patient-Centric Health Dashboard"
        >
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
                No local data found. Create a new profile to get started.
            </p>
            <Button onClick={handleCreateNewProfile} className="w-full">
                Create New Profile
            </Button>
             {hasExistingData && (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive-outline" size="sm" className="w-full">
                           Clear Existing Profile
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete your existing profile from this device and cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={deleteProfile}
                                className="bg-destructive hover:bg-destructive/90"
                            >
                                Delete and Start Over
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
          </div>
        </UniversalCard>
      </div>
    </div>
  );
}
