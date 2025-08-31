
'use client';

import * as React from 'react';
import { ProfileCard } from '@/components/profile-card';
import { InsightsCard } from '@/components/insights-card';
import { ReminderCard } from '@/components/reminder-card';
import { useApp } from '@/context/app-context';
import { Hba1cCard } from '@/components/hba1c-card';
import { ArrowLeft } from 'lucide-react';
import { LipidCard } from '@/components/lipid-card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { VitaminDCard } from '@/components/vitamin-d-card';
import { ReportCard } from '@/components/report-card';
import { ThyroidCard } from '@/components/thyroid-card';
import { HypertensionCard } from '@/components/hypertension-card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TitleBar } from '@/components/title-bar';
import { MedicalHistoryCard } from '@/components/medical-history-card';
import { WeightRecordCard } from '@/components/weight-record-card';
import { PatientHeader } from '@/components/patient-header';

export default function PatientDashboard() {
  const { isClient, dashboardView, isDoctorLoggedIn, doctorName } = useApp();
  const router = useRouter();

  if (!isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const renderDashboard = () => {
    switch (dashboardView) {
      case 'hba1c':
        return <Hba1cCard />;
      case 'lipids':
        return <LipidCard />;
      case 'vitaminD':
        return <VitaminDCard />;
      case 'thyroid':
        return <ThyroidCard />;
      case 'hypertension':
        return <HypertensionCard />;
      case 'report':
        return <ReportCard />;
      default:
        return null;
    }
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col bg-background">
         <TitleBar doctorName={doctorName} doctorEmail={'drbadhri@gmail.com'}>
            {isDoctorLoggedIn && (
                 <div className="absolute top-4 left-4">
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <Button onClick={() => router.push('/doctor/dashboard')} size="icon" variant="ghost">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="sr-only">Back to Patient List</span>
                        </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                        <p>Patient List</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            )}
         </TitleBar>
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto grid w-full max-w-7xl gap-6">
            <PatientHeader />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-start">
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <ProfileCard />
                    <WeightRecordCard />
                    <MedicalHistoryCard />
                </div>
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <InsightsCard />
                    {dashboardView !== 'none' && renderDashboard()}
                </div>
            </div>
            
            <ReminderCard />
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
