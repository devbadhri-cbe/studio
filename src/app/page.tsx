
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import PatientLoginPage from './patient/login/page';

export default function AppRootPage() {
  const { isClient, setIsDoctorLoggedIn, isDoctorLoggedIn: isDoctorLoggedInFromContext } = useApp();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // This handles the case where a doctor is logged in via Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsDoctorLoggedIn(true);
        // If a doctor is logged in, always redirect to their dashboard
        router.replace('/doctor/dashboard');
      } else {
        setIsDoctorLoggedIn(false);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, setIsDoctorLoggedIn]);
  
  // This handles client-side check for patient login via localStorage
   React.useEffect(() => {
    if (isClient && !isDoctorLoggedInFromContext) {
      const patientId = localStorage.getItem('patient_id');
      if (patientId) {
        router.replace(`/patient/${patientId}`);
      } else {
        setIsLoading(false);
      }
    }
  }, [isClient, router, isDoctorLoggedInFromContext]);


  if (!isClient || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // If no one is logged in, render the Patient Login Page as the default entry point.
  return <PatientLoginPage />;
}
