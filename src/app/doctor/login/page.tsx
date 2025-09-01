
'use client';

// This file is effectively deprecated and will be removed in a future step.
// The doctor dashboard is no longer behind an authentication wall in this reverted version.
import { useRouter } from 'next/navigation';
import * as React from 'react';

export default function DoctorLoginPage() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace('/doctor/dashboard');
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <p>Redirecting to dashboard...</p>
    </div>
  );
}
