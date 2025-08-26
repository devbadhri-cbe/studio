
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/app-context';
import DoctorLoginPage from './doctor/login/page';

export default function AppRootPage() {
  const { isClient, isDoctorLoggedIn } = useApp();
  const router = useRouter();

  React.useEffect(() => {
    if (isClient && isDoctorLoggedIn) {
      router.replace('/doctor/dashboard');
    }
  }, [isClient, isDoctorLoggedIn, router]);

  if (!isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // If the doctor is logged in, show a loading/redirecting message or a blank screen.
  // The useEffect will handle the redirection.
  if (isDoctorLoggedIn) {
     return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="ml-4">Redirecting to doctor dashboard...</p>
      </div>
    );
  }

  // If not logged in, render the Doctor Login Page as the default entry point.
  return <DoctorLoginPage />;
}
