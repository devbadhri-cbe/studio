
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import PatientLoginPage from './patient/login/page';
import { getDoctor } from '@/lib/firestore';

export default function AppRootPage() {
  const { isClient, setDoctor } = useApp();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, check if they are a doctor
        const doctor = await getDoctor(user.uid);
        if (doctor) {
          setDoctor(doctor);
          router.replace('/doctor/dashboard');
        } else {
          // Not a doctor, treat as logged out from doctor portal
          setIsLoading(false);
        }
      } else {
        // No user is signed in
        setDoctor(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, setDoctor]);
  

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
