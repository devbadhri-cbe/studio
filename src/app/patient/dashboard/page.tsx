'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { ArrowLeft, Share2, Droplet } from 'lucide-react';
import { PatientHeader } from '@/components/patient-header';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { EditDoctorDetailsDialog } from '@/components/edit-doctor-details-dialog';
import { TitleBar } from '@/components/ui/title-bar';
import { Logo } from '@/components/logo';
import { ProfileCard } from '@/components/profile-card';
import { MedicalHistoryCard } from '@/components/medical-history-card';
import { SharePatientAccessDialog } from '@/components/share-patient-access-dialog';
import { ReminderCard } from '@/components/reminder-card';
import { InsightsCard } from '@/components/insights-card';
import { BiomarkersPanel } from '@/components/biomarkers-panel';
import { DashboardSectionToggle } from '@/components/dashboard-section-toggle';
import { DiseasePanel } from '@/components/disease-panel';
import { AddNewBiomarker } from '@/components/add-new-biomarker';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { WeightRecordCard } from '@/components/weight-record-card';
import { BloodPressureCard } from '@/components/blood-pressure-card';

export default function PatientDashboard() {
  const { isClient, isReadOnlyView, patient } = useApp();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isShareOpen, setIsShareOpen] = React.useState(false);
  
  const [isPanelsOpen, setIsPanelsOpen] = React.useState(true);
  const [isBiomarkersOpen, setIsBiomarkersOpen] = React.useState(false);
  const [isAddingBiomarker, setIsAddingBiomarker] = React.useState(false);
  const [panelSearchQuery, setPanelSearchQuery] = React.useState('');
  const [biomarkerSearchQuery, setBiomarkerSearchQuery] = React.useState('');

  // This check ensures the button is only visible in a non-production, non-read-only context.
  const isDeveloper = process.env.NODE_ENV === 'development' && !isReadOnlyView;

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
          isScrolled={isScrolled}
          rightChildren={
            !isReadOnlyView ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setIsShareOpen(true)}>
                    <Share2 className="h-4 w-4" />
                    <span className="sr-only">Share or Sync Data</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share or Sync Data</p>
                </TooltipContent>
              </Tooltip>
            ) : null
          }
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
            <PatientHeader />
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
            <Separator />
            <div className="space-y-6">
                <Collapsible open={isPanelsOpen} onOpenChange={setIsPanelsOpen}>
                    <DashboardSectionToggle
                        title="Disease Panels"
                        subtitle="Manage multi-biomarker panels for specific conditions"
                        icon={<Droplet className="h-6 w-6 text-primary" />} 
                        isOpen={isPanelsOpen}
                        searchQuery={panelSearchQuery}
                        onSearchChange={setPanelSearchQuery}
                        searchPlaceholder="Search panels..."
                        onCreateClick={() => {}}
                        isCollapsible={true}
                    />
                    <CollapsibleContent>
                        <DiseasePanel searchQuery={panelSearchQuery} />
                    </CollapsibleContent>
                </Collapsible>
                
                <Collapsible open={isBiomarkersOpen} onOpenChange={(isOpen) => { setIsBiomarkersOpen(isOpen); if (!isOpen) setIsAddingBiomarker(false); }}>
                    <DashboardSectionToggle
                        title="All Biomarkers"
                        subtitle="View and manage individual biomarker cards"
                        icon={<Droplet className="h-6 w-6 text-primary" />}
                        isOpen={isBiomarkersOpen}
                        searchQuery={biomarkerSearchQuery}
                        onSearchChange={setBiomarkerSearchQuery}
                        searchPlaceholder="Search biomarkers..."
                        isCollapsible={true}
                        showCreateButton={isDeveloper}
                        onCreateClick={() => setIsAddingBiomarker(!isAddingBiomarker)}
                    />
                     <CollapsibleContent>
                        {isAddingBiomarker ? (
                            <AddNewBiomarker onCancel={() => setIsAddingBiomarker(false)} />
                        ) : (
                            <BiomarkersPanel searchQuery={biomarkerSearchQuery} />
                        )}
                     </CollapsibleContent>
                </Collapsible>
            </div>
          </div>
        </main>
      </div>
      {patient && <SharePatientAccessDialog open={isShareOpen} onOpenChange={setIsShareOpen} patient={patient} />}
    </>
  );
}
