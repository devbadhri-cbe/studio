
'use client';

import { PatientCard } from '@/components/patient-card';
import { TitleBar } from '@/components/ui/title-bar';
import { mockPatients } from '@/lib/mock-patients';
import { Patient } from '@/lib/types';
import { PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { Button } from '@/components/ui/button';

export default function DoctorDashboard() {
  const router = useRouter();
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
    // In a real application, this would navigate to a detailed view.
    // For this prototype, clicking a card will navigate to the patient login/creation flow.
    router.push('/patient/login');
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <TitleBar
        title={['Doctor', 'Dashboard']}
        isScrolled={isScrolled}
      />
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto grid w-full max-w-7xl gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Patient Overview</h2>
            <Button size="sm" onClick={() => router.push('/patient/login')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Patient
            </Button>
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
