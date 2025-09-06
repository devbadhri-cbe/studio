
'use client';

import * as React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/app-context';
import { getPatient } from '@/lib/firestore';
import { PatientDashboard } from '@/components/patient-dashboard';
import { processPatientData } from '@/lib/utils';

export default function PatientPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { setPatientData, isClient, setIsDoctorLoggedIn } = useApp();
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  const isDoctorViewing = searchParams.get('viewer') === 'doctor';

  React.useEffect(() => {
    setIsDoctorLoggedIn(isDoctorViewing);

    const loadPatientData = async () => {
      const patientId = params.patientId as string;
      if (!patientId) {
          setError("No patient ID provided.");
          setIsLoading(false);
          return;
      };

      try {
        const rawPatientData = await getPatient(patientId);
        if (rawPatientData) {
          const patientData = processPatientData(rawPatientData);
          setPatientData(patientData);
        } else {
          setError(`No patient found with ID: ${patientId}`);
        }
      } catch (err) {
        console.error("Failed to fetch patient data", err);
        setError("Failed to load patient data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isClient) {
        loadPatientData();
    }
    
  }, [params.patientId, setPatientData, isClient, setIsDoctorLoggedIn, isDoctorViewing]);

  if (isLoading || !isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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

  // The PatientDashboard component will now have the correct data from the context
  return <PatientDashboard />;
}
