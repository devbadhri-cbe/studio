
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
    // This effect should only run on the client side.
    if (!isClient) return;

    // This page is for shared views, not for direct navigation by the primary user.
    // If a user with local data lands here, they should be redirected to their main dashboard.
    if (patientId === 'dashboard' || patientId === 'login') {
       if(hasLocalData()) {
            router.replace('/patient/dashboard');
       } else {
            router.replace('/patient/login');
       }
       return;
    }
    
    const loadSharedData = () => {
      const sharedData = searchParams.get('data');
      
      // If there's shared data in the URL, it's a doctor's or shared view.
      if (sharedData) {
        try {
          const patientData: Patient = JSON.parse(atob(sharedData));
          // Check if the ID in the URL matches the ID in the data payload.
          if (patientData.id !== patientId) {
             setError("The shared link is invalid. The patient ID does not match the provided data.");
             return;
          }
          setPatientData(patientData, true); // Set for doctor view (isDoctorView = true)
        } catch (e) {
          console.error("Failed to parse shared data", e);
          setError("The shared patient data is invalid or corrupted.");
        } finally {
            setIsLoading(false);
        }
        return;
      }

      // If no shared data, but the user has local data, redirect them.
      if (hasLocalData()) {
          loadLocalPatientData();
          router.replace('/patient/dashboard');
      } else {
          // If no shared data and no local data, show an error.
          setError("No patient data found. Please create a profile or use a valid shared link.");
          setIsLoading(false);
      }
    };
    
    loadSharedData();
    
  }, [isClient, setPatientData, toast, searchParams, hasLocalData, loadLocalPatientData, router, patientId]);
  
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

  // Only render the dashboard if there is no error and loading is complete.
  return <PatientDashboard />;
}
