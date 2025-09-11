
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UniversalCard } from '@/components/universal-card';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { PatientForm, type PatientFormData } from '@/components/patient-form';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ftInToCm } from '@/lib/utils';
import { countries } from '@/lib/countries';
import { useApp } from '@/context/app-context';
import type { Patient } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export default function PatientLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { loadLocalPatientData, hasLocalData } = useApp();
  const [isCreating, setIsCreating] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (hasLocalData()) {
      loadLocalPatientData();
      router.replace(`/patient/dashboard`);
    } else {
      setIsLoading(false);
    }
  }, [hasLocalData, loadLocalPatientData, router]);

  const handleCreateNewProfile = () => {
    setIsCreating(true);
  };

  const handleFormSubmit = (data: PatientFormData) => {
    setIsSubmitting(true);
    const isImperial = countries.find(c => c.code === data.country)?.unitSystem === 'imperial';
    
    let heightInCm: number | undefined;
    if (isImperial) {
        const ft = data.height_ft ? Number(data.height_ft) : 0;
        const inches = data.height_in ? Number(data.height_in) : 0;
        heightInCm = ft > 0 || inches > 0 ? ftInToCm(ft, inches) : undefined;
    } else {
        heightInCm = data.height ? Number(data.height) : undefined;
    }

    const patientData: Patient = {
        id: uuidv4(),
        name: data.name,
        dob: data.dob.toISOString(),
        gender: data.gender,
        email: data.email || '',
        country: data.country,
        phone: data.phone || '',
        height: heightInCm,
        dateFormat: 'MM-dd-yyyy',
        unitSystem: isImperial ? 'imperial' : 'metric',
        status: 'On Track',
        hba1cRecords: [],
        fastingBloodGlucoseRecords: [],
        thyroidRecords: [],
        thyroxineRecords: [],
        serumCreatinineRecords: [],
        uricAcidRecords: [],
        hemoglobinRecords: [],
        weightRecords: [],
        bloodPressureRecords: [],
        totalCholesterolRecords: [],
        ldlRecords: [],
        hdlRecords: [],
        triglyceridesRecords: [],
        medication: [],
        presentMedicalConditions: [],
        enabledBiomarkers: {},
        doctorUid: 'doc_12345'
    };

    try {
        localStorage.setItem('patientData', JSON.stringify(patientData));
        toast({
            title: 'Profile Created',
            description: `Your patient profile has been created successfully.`,
        });
        router.push(`/patient/dashboard`);
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
  
  if (isLoading) {
    return (
        <div className="flex h-screen items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4">Loading Health Guardian...</p>
        </div>
    );
  }


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
                title="Create New Patient Profile"
                description="Enter your details to create a health dashboard."
                className="w-full max-w-2xl"
            >
                {formContent}
            </UniversalCard>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <UniversalCard 
            title="Health Guardian"
            description="Your Patient-Centric Health Dashboard"
            icon={<Logo className="h-12 w-12 text-primary" />}
        >
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
                No local data found. Create a new profile to get started.
            </p>
            <Button onClick={handleCreateNewProfile} className="w-full">
                Create New Profile
            </Button>
          </div>
        </UniversalCard>
      </div>
    </div>
  );
}
