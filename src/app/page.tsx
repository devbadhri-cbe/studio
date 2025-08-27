
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/app-context';
import DoctorLoginPage from './doctor/login/page';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function AppRootPage() {
  const { isClient, setIsDoctorLoggedIn } = useApp();
  const router = useRouter();
  const [isAuthLoading, setIsAuthLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsDoctorLoggedIn(true);
        router.replace('/doctor/dashboard');
      } else {
        setIsDoctorLoggedIn(false);
      }
      setIsAuthLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router, setIsDoctorLoggedIn]);
  

  if (!isClient || isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // If not logged in, render the Doctor Login Page as the default entry point.
  return <DoctorLoginPage />;
}
