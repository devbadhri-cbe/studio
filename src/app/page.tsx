'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

// The root of the app should redirect to the doctor's dashboard.
// The patient-specific pages are accessed via a direct link.
export default function AppRootPage() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace('/doctor/dashboard');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="ml-4">Redirecting...</p>
    </div>
  );
}
