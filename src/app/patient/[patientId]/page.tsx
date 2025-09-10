
'use client';

import * as React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/app-context';
import { getPatient, updatePatient } from '@/lib/firestore';
import { PatientDashboard } from '@/components/patient-dashboard';
import { processPatientData } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { Patient } from '@/lib/types';

export default function PatientPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { setPatientData, isClient } = useApp();
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();
  
  React.useEffect(() => {
    const loadPatientData = async () => {
      const patientId = params.patientId as string;
      if (!patientId) {
          setError("No patient ID provided.");
          setIsLoading(false);
          return;
      };
      
      const isDoctorView = searchParams.get('view') === 'doctor';

      try {
        const rawPatientData = await getPatient(patientId);
        if (rawPatientData) {
          const patientData = processPatientData(rawPatientData);
          setPatientData(patientData, isDoctorView);

          // Only update lastLogin if it's the patient viewing their own dashboard
          if (!isDoctorView) {
            await updatePatient(patientId, { lastLogin: new Date().toISOString() });
          }
        } else {
          setError(`No patient found with ID: ${patientId}`);
        }
      } catch (err) {
        console.error("Failed to fetch or update patient data", err);
        setError("Failed to load patient data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isClient) {
        loadPatientData();
    }
    
  }, [params.patientId, isClient, setPatientData, toast, searchParams]);

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

  return <PatientDashboard />;
}
