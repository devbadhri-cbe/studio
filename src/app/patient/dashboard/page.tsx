
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Separator } from '@/components/ui/separator';
import { TitleBar } from '@/components/ui/title-bar';
import { PatientLoginPage } from '@/components/patient-login-page';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PatientHeader } from '@/components/patient-header';
import { ProfileCard } from '@/components/profile-card';
import { WeightRecordCard } from '@/components/weight-record-card';
import { BloodPressureCard } from '@/components/blood-pressure-card';
import { MedicalHistoryCard } from '@/components/medical-history-card';
import { ReminderCard } from '@/components/reminder-card';
import { InsightsCard } from '@/components/insights-card';
import { DiabetesCard } from '@/components/diabetes-card';
import { HypertensionCard } from '@/components/hypertension-card';
import { LipidPanelCard } from '@/components/lipid-panel-card';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { AnemiaCard } from '@/components/anemia-card';

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
  
  const DiseasePanels = () => {
    const panels = [
        <HypertensionCard key="hypertension" />,
        <AnemiaCard key="anemia" />,
        <DiabetesCard key="diabetes" />,
        <LipidPanelCard key="lipid" />,
    ];

    if (isMobile) {
        return (
            <Carousel opts={{ align: "start", loop: false }} className="w-full">
                <CarouselContent>
                    {panels.map((panel, index) => (
                        <CarouselItem key={index} className="basis-11/12">
                           {panel}
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        )
    }

    return (
        <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <HypertensionCard />
                <AnemiaCard />
            </div>
            <DiabetesCard />
            <LipidPanelCard />
        </div>
    );
  }


  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <TitleBar
          title={['Health', 'Guardian', 'Lite']}
          subtitle={developerCredit}
        />
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
                    <DiseasePanels />
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
