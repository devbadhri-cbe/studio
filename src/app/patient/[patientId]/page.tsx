
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/app-context';
import { PatientDashboard } from '@/components/patient-dashboard';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Patient } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function PatientPage() {
  const searchParams = useSearchParams();
  const { setPatientData, isClient, hasLocalData, loadLocalPatientData } = useApp();
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  
  React.useEffect(() => {
    const loadPatientData = async () => {
      // Logic for loading shared data for doctor view
      const sharedData = searchParams.get('data');
      const isDoctorView = searchParams.get('view') === 'doctor';

      if (isDoctorView && sharedData) {
        try {
          const patientData: Patient = JSON.parse(atob(sharedData));
          setPatientData(patientData, true);
        } catch (e) {
          console.error("Failed to parse shared data", e);
          setError("The shared patient data is invalid or corrupted.");
        } finally {
            setIsLoading(false);
        }
        return;
      }
      
      // Default logic for patient's own view
      if (hasLocalData()) {
          loadLocalPatientData();
          setIsLoading(false);
      } else {
          toast({
              title: "No Patient Data Found",
              description: "Create a new profile to get started.",
              variant: "destructive"
          });
          router.replace('/patient/login');
      }
    };
    
    if (isClient) {
        loadPatientData();
    }
    
  }, [isClient, setPatientData, toast, searchParams, hasLocalData, loadLocalPatientData, router]);

  if (isLoading || !isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
         <p className="ml-4">Loading patient data...</p>
      </div>
    );
  }

  if (error) {
     return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center text-destructive">
            <h1 className="text-xl font-bold">Error</h1>
            <p>{error}</p>
        </div>
      </div>
    );
  }

  // Redirect old patientId routes to the generic dashboard route
  if (window.location.pathname.includes('/patient/') && window.location.pathname !== '/patient/dashboard') {
    router.replace('/patient/dashboard');
    return null;
  }

  return <PatientDashboard />;
}
