'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { ArrowLeft, Share2 } from 'lucide-react';
import { PatientHeader } from '@/components/patient-header';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { doctorDetails } from '@/lib/doctor-data';
import { EditDoctorDetailsDialog } from './edit-doctor-details-dialog';
import { TitleBar } from '@/components/ui/title-bar';
import { Logo } from './logo';
import { ProfileCard } from './profile-card';
import { MedicalHistoryCard } from './medical-history-card';
import { SharePatientAccessDialog } from './share-patient-access-dialog';
import { Hba1cCard } from './hba1c-card';
import { ReminderCard } from './reminder-card';
import { InsightsCard } from './insights-card';
import { BiomarkersPanel } from './biomarkers-panel';
import { DashboardSectionToggle } from './dashboard-section-toggle';
import { DiseasePanel } from './disease-panel';
import { AddBiomarkerCard } from './add-biomarker-card';
import { Collapsible, CollapsibleContent } from './ui/collapsible';

export function PatientDashboard() {
  const { isClient, isReadOnlyView, patient } = useApp();
  const router = useRouter();
  const [isEditingDoctor, setIsEditingDoctor] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isShareOpen, setIsShareOpen] = React.useState(false);
  
  const [isPanelsOpen, setIsPanelsOpen] = React.useState(true);
  const [isBiomarkersOpen, setIsBiomarkersOpen] = React.useState(false);
  const [panelSearchQuery, setPanelSearchQuery] = React.useState('');
  const [biomarkerSearchQuery, setBiomarkerSearchQuery] = React.useState('');


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

  const BackButton = isReadOnlyView ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" onClick={() => router.push('/patient/login')}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back to Login</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Back to Login</p>
      </TooltipContent>
    </Tooltip>
  ) : null;
  
  const ShareButton = !isReadOnlyView ? (
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
  ) : null;

  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <TitleBar
          title={['Health', 'Guardian']}
          subtitle={doctorDetails.name}
          onSubtitleClick={() => setIsEditingDoctor(true)}
          backButton={BackButton}
          isScrolled={isScrolled}
        >
            {ShareButton}
        </TitleBar>
        <main className="flex-1 p-4 md:p-6 pb-4">
          <div className="mx-auto grid w-full max-w-7xl gap-6">
            <PatientHeader />
            <Separator />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 grid grid-cols-1 gap-6">
                    <ProfileCard />
                    <MedicalHistoryCard />
                </div>
                <div className="space-y-6">
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
                        icon={<Hba1cCard />} // Placeholder icon
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
                
                <Collapsible open={isBiomarkersOpen} onOpenChange={setIsBiomarkersOpen}>
                    <DashboardSectionToggle
                        title="All Biomarkers"
                        subtitle="View and manage individual biomarker cards"
                        icon={<Hba1cCard />} // Placeholder icon
                        isOpen={isBiomarkersOpen}
                        searchQuery={biomarkerSearchQuery}
                        onSearchChange={setBiomarkerSearchQuery}
                        searchPlaceholder="Search biomarkers..."
                        isCollapsible={true}
                    />
                     <CollapsibleContent>
                        <BiomarkersPanel searchQuery={biomarkerSearchQuery}/>
                     </CollapsibleContent>
                </Collapsible>

                <AddBiomarkerCard />
            </div>
          </div>
        </main>
      </div>
      <EditDoctorDetailsDialog open={isEditingDoctor} onOpenChange={setIsEditingDoctor} />
      {patient && <SharePatientAccessDialog open={isShareOpen} onOpenChange={setIsShareOpen} patient={patient} />}
    </>
  );
}
