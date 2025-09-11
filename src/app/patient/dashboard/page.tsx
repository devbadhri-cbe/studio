
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { PatientDashboard } from '@/components/patient-dashboard';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { isClient, hasLocalData, loadLocalPatientData } = useApp();
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const router = useRouter();
  
  React.useEffect(() => {
    const loadPatientData = () => {
      if (hasLocalData()) {
          loadLocalPatientData();
          setIsLoading(false);
      } else {
          toast({
              title: "No Patient Data Found",
              description: "Create a new profile to get started.",
              variant: "destructive"
          });
          router.replace('/patient/login');
      }
    };
    
    if (isClient) {
        loadPatientData();
    }
    
  }, [isClient, toast, hasLocalData, loadLocalPatientData, router]);

  if (isLoading || !isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
         <p className="ml-4">Loading patient data...</p>
      </div>
    );
  }

  return <PatientDashboard />;
}
