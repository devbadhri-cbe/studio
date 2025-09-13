
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { ArrowLeft } from 'lucide-react';
import { PatientHeader } from '@/components/patient-header';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { TitleBar } from '@/components/ui/title-bar';
import { Logo } from './logo';
import { ProfileCard } from './profile-card';
import { MedicalHistoryCard } from './medical-history-card';
import { ReminderCard } from './reminder-card';
import { InsightsCard } from './insights-card';
import { WeightRecordCard } from './weight-record-card';
import { BloodPressureCard } from './blood-pressure-card';

export function PatientDashboard() {
  const { isClient, isReadOnlyView, patient } = useApp();
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

  if (!isClient || !patient) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Logo className="h-24 w-24" />
          <p className="ml-4 text-lg animate-pulse">Loading patient data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <TitleBar
          title={['Health', 'Guardian', 'Lite']}
          subtitle="Developer, Dr N Badhrinathan"
          isScrolled={isScrolled}
        >
          {isReadOnlyView && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => router.push('/patient/dashboard')}>
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Back to Login</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Back to Login</p>
              </TooltipContent>
            </Tooltip>
          )}
        </TitleBar>
        <main className="flex-1 p-4 md:p-6 pb-4">
          <div className="mx-auto grid w-full max-w-7xl gap-6">
            <div className="flex items-center gap-4">
                <PatientHeader />
            </div>
            <Separator />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 grid grid-cols-1 gap-6">
                    <ProfileCard />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <WeightRecordCard />
                        <BloodPressureCard />
                    </div>
                    <MedicalHistoryCard />
                </div>
                <div className="lg:col-span-1 grid grid-cols-1 gap-6">
                    <ReminderCard />
                    <InsightsCard />
                </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
