
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { ArrowLeft, Stethoscope, DropletIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MedicalHistoryCard } from '@/components/medical-history-card';
import { PatientHeader } from '@/components/patient-header';
import { Separator } from '@/components/ui/separator';
import { DoctorReviewCard } from '@/components/doctor-review-card';
import { TitleBar } from '@/components/title-bar';
import { EditHeightDialog, type EditHeightDialogHandles } from '@/components/edit-height-dialog';
import { WeightRecordCard } from '@/components/weight-record-card';
import { OnboardingTour } from '@/components/onboarding-tour';
import { BloodPressureCard } from '@/components/blood-pressure-card';
import { DiseasePanel } from '@/components/disease-panel';
import { BiomarkersPanel } from '@/components/biomarkers-panel';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { InsightsCard } from '@/components/insights-card';
import { ReminderCard } from '@/components/reminder-card';
import { VitaminDCard } from '@/components/vitamin-d-card';
import { ReportCard } from '@/components/report-card';
import { ThyroidCard } from '@/components/thyroid-card';
import { RenalCard } from '@/components/renal-card';
import { BiomarkersCard } from '@/components/biomarkers-card';
import { ProfileCard } from '@/components/profile-card';


export default function PatientDashboard() {
  const { isClient, isDoctorLoggedIn, profile } = useApp();
  const router = useRouter();
  const editHeightDialogRef = React.useRef<EditHeightDialogHandles>(null);
  const [isDiseasePanelOpen, setIsDiseasePanelOpen] = React.useState(false);
  const [isBiomarkersPanelOpen, setIsBiomarkersPanelOpen] = React.useState(false);
  
  const hasPendingReview = (profile.presentMedicalConditions.some(c => c.status === 'pending_review'));
  const showBiomarkersCard = (profile.enabledDashboards?.includes('hba1c') || profile.enabledDashboards?.includes('glucose') || profile.enabledDashboards?.includes('anemia')) && !profile.enabledDashboards?.includes('diabetes');
  
  React.useEffect(() => {
    // Pass the ref to the weight card component instance
    const weightCardElement = document.getElementById('weight-record-card');
    if (weightCardElement) {
        (weightCardElement as any).editHeightDialogRef = editHeightDialogRef;
    }
  }, []);

  if (!isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col bg-background">
         <TitleBar>
            {isDoctorLoggedIn && (
                <div className="flex items-center gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <Button onClick={() => router.push('/doctor/dashboard')} size="icon" variant="ghost">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                        <p>Return to Patient List</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            )}
         </TitleBar>

        <main className="flex-1 p-4 md:pt-10 md:p-6">
          <div className="mx-auto grid w-full max-w-7xl gap-6">
             
            <PatientHeader />
            
            {isDoctorLoggedIn && hasPendingReview && <DoctorReviewCard />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Collapsible open={isDiseasePanelOpen} onOpenChange={setIsDiseasePanelOpen}>
                <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full">
                        <Stethoscope className="mr-2 h-4 w-4" />
                        Disease Panels
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <DiseasePanel />
                </CollapsibleContent>
              </Collapsible>
              <Collapsible open={isBiomarkersPanelOpen} onOpenChange={setIsBiomarkersPanelOpen}>
                <CollapsibleTrigger asChild>
                     <Button variant="outline" className="w-full">
                        <DropletIcon className="mr-2 h-4 w-4" />
                        Biomarker Cards
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <BiomarkersPanel />
                </CollapsibleContent>
              </Collapsible>
            </div>
            
            <div className="space-y-6" id="tour-step-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <ProfileCard />
                </div>
                 <div className="lg:col-span-2 flex flex-col gap-6">
                    <MedicalHistoryCard />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <WeightRecordCard />
                <BloodPressureCard />
            </div>

            <Separator />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-start" id="tour-step-3">
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <ReminderCard />
                </div>
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <InsightsCard />
                </div>
            </div>
            
            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="tour-step-4">
                 {showBiomarkersCard && <BiomarkersCard />}
                 {profile.enabledDashboards?.includes('vitaminD') && <VitaminDCard />}
                 {profile.enabledDashboards?.includes('thyroid') && <ThyroidCard />}
                 {profile.enabledDashboards?.includes('renal') && <RenalCard />}
            </div>

            <Separator />
            
            <div className="printable-area" id="tour-step-5">
                <ReportCard />
            </div>
            
          </div>
        </main>
      </div>
      <EditHeightDialog ref={editHeightDialogRef} />
      {isClient && !isDoctorLoggedIn && <OnboardingTour />}
    </TooltipProvider>
  );
}
