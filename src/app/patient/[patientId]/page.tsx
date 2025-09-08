
'use client';

import * as React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/app-context';
import { getPatient, updatePatient } from '@/lib/firestore';
import { PatientDashboard } from '@/components/patient-dashboard';
import { processPatientData } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/auth';
import type { User } from 'firebase/auth';

export default function PatientPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { setPatientData, isClient, setIsDoctorLoggedIn } = useApp();
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();
  const [user, setUser] = React.useState<User | null>(null);
  
  const isDoctorViewing = searchParams.get('viewer') === 'doctor';

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    setIsDoctorLoggedIn(isDoctorViewing);

    const loadPatientData = async () => {
      const patientId = params.patientId as string;
      if (!patientId || !user) {
          setError("No patient ID provided or user not logged in.");
          setIsLoading(false);
          return;
      };

      try {
        const rawPatientData = await getPatient(patientId);
        if (rawPatientData) {
          
          // If a doctor is viewing and the patient already has a DIFFERENT doctor, deny access.
          if (isDoctorViewing && rawPatientData.doctorUid && rawPatientData.doctorUid !== user.uid) {
            setError("Access Denied. You are not the assigned doctor for this patient.");
            setIsLoading(false);
            return;
          }

          // If a doctor is viewing and the patient has NO doctor, assign this doctor.
          const updates: Partial<Patient> = {};
          let needsUpdate = false;

          if (isDoctorViewing && !rawPatientData.doctorUid) {
            updates.doctorUid = user.uid;
            updates.doctorName = user.displayName || user.email || 'Assigned Doctor';
            updates.doctorEmail = user.email || '';
            needsUpdate = true;
          }
          
          if (isDoctorViewing) {
            updates.lastLogin = new Date().toISOString();
            needsUpdate = true;
          }

          if (needsUpdate) {
            const updatedData = await updatePatient(patientId, updates);
            const patientData = processPatientData(updatedData);
            setPatientData(patientData);
          } else {
             const patientData = processPatientData(rawPatientData);
             setPatientData(patientData);
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
    
    if (isClient && user) {
        loadPatientData();
    }
    
  }, [params.patientId, isClient, isDoctorViewing, setPatientData, setIsDoctorLoggedIn, toast, user]);

  if (isLoading || !isClient || !user) {
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
