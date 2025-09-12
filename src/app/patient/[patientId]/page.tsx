
'use client';

import * as React from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { useApp } from '@/context/app-context';
import { PatientDashboard } from '@/components/patient-dashboard';
import { Loader2 } from 'lucide-react';
import { Patient } from '@/lib/types';
import { Logo } from '@/components/logo';

export default function SharedPatientPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const { setPatientData, isClient } = useApp();
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  const patientId = params.patientId as string;

  React.useEffect(() => {
    if (!isClient) return;

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
      setError("No shared patient data found in the link.");
      setIsLoading(false);
    }
  }, [isClient, patientId, searchParams, setPatientData]);
  
  if (isLoading || !isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
            <Logo className="h-24 w-24" />
            <p className="ml-4 text-lg animate-pulse">Loading shared patient data...</p>
        </div>
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
