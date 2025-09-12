
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { PatientDashboard } from '@/components/patient-dashboard';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';

export default function DashboardPage() {
  const { isClient, hasLocalData, loadLocalPatientData, profile } = useApp();
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const router = useRouter();

  React.useEffect(() => {
    if (!isClient) return;

    if (hasLocalData()) {
      // The profile should be loaded by the time we get here from the login page redirect.
      setIsLoading(false);
    } else {
      // If for some reason we land here without data, go back to login.
      router.replace('/patient/login');
    }
  }, [isClient, hasLocalData, router]);

  if (isLoading || !isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
            <Logo className="h-24 w-24" />
            <p className="ml-4 text-lg animate-pulse">Loading patient data...</p>
        </div>
      </div>
    );
  }

  return <PatientDashboard />;
}
