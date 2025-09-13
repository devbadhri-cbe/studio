
'use client';

import { PatientCard } from '@/components/patient-card';
import { TitleBar } from '@/components/ui/title-bar';
import { mockPatients } from '@/lib/mock-patients';
import { Patient } from '@/lib/types';
import { PlusCircle, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function HomeDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsScrolled(offset > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePatientAction = (patient: Patient) => {
    console.log(`Action for mock patient ${patient.name} triggered.`);
    toast({
      title: 'Demonstration Action',
      description: 'This is a mock patient profile. Create a new profile to use the app.',
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <TitleBar
        title={['Home', 'Dashboard']}
        isScrolled={isScrolled}
      />
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto grid w-full max-w-7xl gap-6">
           <Alert className="bg-primary/5 border-primary/20">
              <Info className="h-4 w-4" />
              <AlertTitle>Welcome, Developer!</AlertTitle>
              <AlertDescription>
                This is the developer home page. The patient profiles below are mock data for demonstration. To use the app as a patient, click &quot;Create New Profile&quot; to begin.
              </AlertDescription>
            </Alert>
            <div className="flex items-center justify-between">
                 <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('/project-plan.html', '_blank')}
                    >
                    <FileText className="mr-2 h-4 w-4" />
                    Project Plan
                </Button>
                <Button size="sm" onClick={() => router.push('/patient/dashboard')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Profile
                </Button>
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Example Patient Profiles</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {mockPatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onView={handlePatientAction}
                onEdit={handlePatientAction}
                onDelete={handlePatientAction}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
