
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { TitleBar } from '@/components/ui/title-bar';
import { PatientLoginPage } from '@/components/patient-login-page';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PatientHeader } from '@/components/patient-header';
import { ProfileCard } from '@/components/profile-card';
import { WeightRecordCard } from '@/components/weight-record-card';
import { BloodPressureCard } from '@/components/blood-pressure-card';
import { ReminderCard } from '@/components/reminder-card';
import { InsightsCard } from '@/components/insights-card';
import { DiabetesCard } from '@/components/diabetes-card';
import { LipidPanelCard } from '@/components/lipid-panel-card';
import { AnemiaCard } from '@/components/anemia-card';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { MedicalHistoryCard } from '@/components/medical-history-card';


export default function PatientDashboardPage() {
  const { isClient, patient } = useApp();
  const isMobile = useIsMobile();

  if (!isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <p className="ml-4 text-lg animate-pulse">Loading patient data...</p>
        </div>
      </div>
    );
  }

  // If no patient data is found, show the login/creation page.
  if (!patient) {
    return <PatientLoginPage />;
  }

  const developerCredit = (
    <Tooltip>
        <TooltipTrigger asChild>
            <a href="mailto:dev.badhri@gmail.com" className="hover:underline">
                Dr N Badhrinathan
            </a>
        </TooltipTrigger>
        <TooltipContent>
            <p>dev.badhri@gmail.com</p>
        </TooltipContent>
    </Tooltip>
  );

  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <TitleBar
          title={['Health', 'Guardian', 'Lite']}
          subtitle={developerCredit}
        />
        <main className="flex-1 p-4 md:p-6 pb-4">
          <div className="mx-auto grid w-full max-w-xl gap-6">
            <PatientHeader />
            <ProfileCard />
            <MedicalHistoryCard />
            <WeightRecordCard />
            <BloodPressureCard />
            <AnemiaCard />
            <DiabetesCard />
            <LipidPanelCard />
            <ReminderCard />
            <InsightsCard />
          </div>
        </main>
      </div>
    </>
  );
}
