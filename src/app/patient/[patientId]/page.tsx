
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
  
  const patientId = params.patientId as string;

  React.useEffect(() => {
    if (!isClient) return;

    if (hasLocalData()) {
      loadLocalPatientData();
      router.replace('/patient/dashboard');
      return;
    }

    const sharedData = searchParams.get('data');
    
    if (sharedData) {
      try {
        const patientData: Patient = JSON.parse(atob(sharedData));
        if (patientData.id !== patientId) {
          setError("The shared link is invalid. The patient ID does not match the provided data.");
        } else {
          setPatientData(patientData, true); // Set for read-only view
        }
      } catch (e) {
        console.error("Failed to parse shared data", e);
        setError("The shared patient data is invalid or corrupted.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setError("No patient data found. Please create a profile or use a valid shared link.");
      setIsLoading(false);
      router.replace('/patient/login');
    }
  }, [isClient, patientId, router, searchParams, setPatientData, hasLocalData, loadLocalPatientData]);
  
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
