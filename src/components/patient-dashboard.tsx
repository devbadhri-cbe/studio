
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { ArrowLeft, Stethoscope, DropletIcon, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MedicalHistoryCard } from '@/components/medical-history-card';
import { PatientHeader } from '@/components/patient-header';
import { Separator } from '@/components/ui/separator';
import { DoctorReviewCard } from '@/components/doctor-review-card';
import { TitleBar } from '@/components/title-bar';
import { DiseasePanel } from '@/components/disease-panel';
import { BiomarkersPanel } from '@/components/biomarkers-panel';
import { InsightsCard } from '@/components/insights-card';
import { ReminderCard } from '@/components/reminder-card';
import { ReportCard } from '@/components/report-card';
import { ProfileCard } from '@/components/profile-card';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';


export function PatientDashboard() {
  const { isClient, isDoctorLoggedIn, profile } = useApp();
  const router = useRouter();
  const [isDiseasePanelOpen, setIsDiseasePanelOpen] = React.useState(false);
  const [isBiomarkersOpen, setIsBiomarkersOpen] = React.useState(false);
  
  const hasPendingReview = (profile.presentMedicalConditions.some(c => c.status === 'pending_review'));
  
  // This check is removed to always show the biomarker panel for patients.
  // The logic to show specific cards is now fully handled within BiomarkersPanel.
  const hasEnabledBiomarkers = React.useMemo(() => {
    if (!profile.enabledBiomarkers) return false;
    return Object.values(profile.enabledBiomarkers).some(panel => panel.length > 0);
  }, [profile.enabledBiomarkers]);
  
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

             {(isDoctorLoggedIn || hasEnabledBiomarkers) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Collapsible open={isDiseasePanelOpen} onOpenChange={setIsDiseasePanelOpen} className="col-span-1">
                        <CollapsibleTrigger asChild>
                            <Button
                                variant={isDiseasePanelOpen ? 'default' : 'outline'}
                                className={cn("w-full py-6 text-base", isDiseasePanelOpen && "shadow-lg")}
                            >
                                <Stethoscope className="mr-2 h-5 w-5" />
                                Disease Panels
                                <ChevronDown className={cn("ml-auto h-5 w-5 transition-transform", isDiseasePanelOpen && "rotate-180")} />
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-4">
                            <DiseasePanel />
                        </CollapsibleContent>
                    </Collapsible>

                    {isDoctorLoggedIn && (
                        <Collapsible open={isBiomarkersOpen} onOpenChange={setIsBiomarkersOpen} className="col-span-1">
                            <CollapsibleTrigger asChild>
                                <Button
                                    variant={isBiomarkersOpen ? 'default' : 'outline'}
                                    className={cn("w-full py-6 text-base", isBiomarkersOpen && "shadow-lg")}
                                >
                                    <DropletIcon className="mr-2 h-5 w-5" />
                                    Biomarker Cards
                                    <ChevronDown className={cn("ml-auto h-5 w-5 transition-transform", isBiomarkersOpen && "rotate-180")} />
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-4">
                                <BiomarkersPanel />
                            </CollapsibleContent>
                        </Collapsible>
                    )}
                </div>
             )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 flex flex-col gap-6">
                  <ProfileCard />
              </div>
              <div className="lg:col-span-2 flex flex-col gap-6">
                  <MedicalHistoryCard />
              </div>
            </div>
            
            <Separator />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-start">
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <InsightsCard />
                </div>
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <ReminderCard />
                </div>
            </div>
            
            <Separator />
            
            <div className="printable-area">
                <ReportCard />
            </div>
            
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
