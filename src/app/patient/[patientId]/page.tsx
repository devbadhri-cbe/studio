
'use client';

import * as React from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useApp } from '@/context/app-context';
import { PatientDashboard } from '@/components/patient-dashboard';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Patient } from '@/lib/types';

export default function SharedPatientPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const { setPatientData, isClient, hasLocalData, loadLocalPatientData } = useApp();
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();
  
  const patientId = params.patientId;

  React.useEffect(() => {
    if (patientId === 'dashboard' || patientId === 'login') {
      // This page is not for the main dashboard or login, let their respective pages handle it.
      setIsLoading(false);
      return;
    }
    
    const loadSharedData = async () => {
      const sharedData = searchParams.get('data');
      const isDoctorView = searchParams.get('view') === 'doctor';

      if (isDoctorView && sharedData) {
        try {
          const patientData: Patient = JSON.parse(atob(sharedData));
          setPatientData(patientData, true); // Set for doctor view
        } catch (e) {
          console.error("Failed to parse shared data", e);
          setError("The shared patient data is invalid or corrupted.");
        } finally {
            setIsLoading(false);
        }
        return;
      }

      // If it's a patient viewing their own shared link, redirect to their main dashboard.
      if (hasLocalData()) {
          loadLocalPatientData();
          router.replace('/patient/dashboard');
      } else {
          setError("No patient data found. Please create a profile to view this information.");
          setIsLoading(false);
      }
    };
    
    if (isClient) {
        loadSharedData();
    }
    
  }, [isClient, setPatientData, toast, searchParams, hasLocalData, loadLocalPatientData, router, patientId]);
  
  if (patientId === 'dashboard' || patientId === 'login') {
      // Should be handled by next router, but as a fallback, show nothing.
      return null;
  }

  if (isLoading || !isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
         <p className="ml-4">Loading shared patient data...</p>
      </div>
    );
  }

  if (error) {
     return (
      <div className="flex h-screen items-center justify-center bg-background text-center p-4">
        <div className="text-destructive">
            <h1 className="text-xl font-bold">Error</h1>
            <p>{error}</p>
        </div>
      </div>
    );
  }

  return <PatientDashboard />;
}
