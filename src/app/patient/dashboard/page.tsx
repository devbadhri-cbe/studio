'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { PatientDashboard } from '@/components/patient-dashboard';
import { Logo } from '@/components/logo';
import { PatientLoginPage } from '@/components/patient-login-page';

export default function DashboardPage() {
  const { patient, isLoading } = useApp();
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
            <Logo className="h-24 w-24" />
            <p className="ml-4 text-lg animate-pulse">Loading Health Guardian Lite...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return <PatientLoginPage />;
  }

  return <PatientDashboard />;
}
