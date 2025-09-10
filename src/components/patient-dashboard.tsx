

'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Stethoscope, Shapes, Search, ArrowLeft, PlusCircle } from 'lucide-react';
import { MedicalHistoryCard } from '@/components/medical-history-card';
import { PatientHeader } from '@/components/patient-header';
import { Separator } from '@/components/ui/separator';
import { DiseasePanel } from '@/components/disease-panel';
import { BiomarkersPanel } from '@/components/biomarkers-panel';
import { InsightsCard } from '@/components/insights-card';
import { ReminderCard } from '@/components/reminder-card';
import { ProfileCard } from '@/components/profile-card';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { UnsavedChangesBar } from './unsaved-changes-bar';
import { DashboardSectionToggle } from './dashboard-section-toggle';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { doctorDetails } from '@/lib/doctor-data';
import { EditDoctorDetailsDialog } from './edit-doctor-details-dialog';
import { TitleBar } from '@/components/ui/title-bar';
import { AddNewBiomarker } from './add-new-biomarker';
import { WeightRecordCard } from './weight-record-card';
import { BloodPressureCard } from './blood-pressure-card';

export function PatientDashboard() {
  const { isClient, isDoctorLoggedIn } = useApp();
  const router = useRouter();
  const [isDiseasePanelOpen, setIsDiseasePanelOpen] = React.useState(false);
  const [isBiomarkersOpen, setIsBiomarkersOpen] = React.useState(false);
  const [diseasePanelSearchQuery, setDiseasePanelSearchQuery] = React.useState('');
  const [biomarkerSearchQuery, setBiomarkerSearchQuery] = React.useState('');
  const [isEditingDoctor, setIsEditingDoctor] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isAddingBiomarker, setIsAddingBiomarker] = React.useState(false);
  
  const handleDiseasePanelToggle = (isOpen: boolean) => {
    setIsDiseasePanelOpen(isOpen);
    if (isOpen) setIsBiomarkersOpen(false);
  }
  
  const handleBiomarkersToggle = (isOpen: boolean) => {
    setIsBiomarkersOpen(isOpen);
    if (isOpen) setIsDiseasePanelOpen(false);
  }


  React.useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsScrolled(offset > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  if (!isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const BackButton = isDoctorLoggedIn ? (
    <Tooltip>
        <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => router.push('/doctor/dashboard')}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Dashboard</span>
            </Button>
        </TooltipTrigger>
        <TooltipContent>
            <p>Back to Dashboard</p>
        </TooltipContent>
    </Tooltip>
  ) : null;

  const showDiseasePanel = !isBiomarkersOpen;
  const showBiomarkersPanel = !isDiseasePanelOpen && isDoctorLoggedIn;

  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col bg-background">
         <TitleBar
            title={['Health', 'Guardian']}
            subtitle={doctorDetails.name}
            onSubtitleClick={() => isDoctorLoggedIn && setIsEditingDoctor(true)}
            backButton={BackButton}
            isScrolled={isScrolled}
         />
        <main className="flex-1 p-4 md:p-6 pb-24">
          <div className="mx-auto grid w-full max-w-7xl gap-6">
             
            <PatientHeader />
            
            <Separator />
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <ProfileCard />
                <MedicalHistoryCard />
                <WeightRecordCard />
                <BloodPressureCard />
                <div className="lg:col-span-2">
                    <InsightsCard />
                </div>
            </div>
            
            <Separator />
            
            <div className="flex flex-col md:flex-row gap-4">
              {showDiseasePanel && (
                <div className="flex-1">
                  <Collapsible open={isDiseasePanelOpen} onOpenChange={handleDiseasePanelToggle}>
                    <DashboardSectionToggle
                      title="Disease Panels"
                      subtitle="View and manage panels like Diabetes and Hypertension."
                      icon={<Stethoscope className="h-6 w-6 text-primary" />}
                      isOpen={isDiseasePanelOpen}
                      searchQuery={diseasePanelSearchQuery}
                      onSearchChange={setDiseasePanelSearchQuery}
                      searchPlaceholder="Search panels..."
                    />
                    <CollapsibleContent className="mt-4">
                      <DiseasePanel searchQuery={diseasePanelSearchQuery} />
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )}

              {showBiomarkersPanel && (
                 <div className="flex-1">
                    <Collapsible open={isBiomarkersOpen} onOpenChange={handleBiomarkersToggle}>
                      <DashboardSectionToggle
                        title="Biomarker Management"
                        subtitle="Enable or disable individual biomarker tracking cards."
                        icon={<Shapes className="h-6 w-6 text-primary" />}
                        isOpen={isBiomarkersOpen}
                        searchQuery={biomarkerSearchQuery}
                        onSearchChange={setBiomarkerSearchQuery}
                        searchPlaceholder="Search biomarkers..."
                        showCreateButton={true}
                        onCreateClick={() => setIsAddingBiomarker(true)}
                      />
                      <CollapsibleContent className="mt-4 space-y-4">
                        {isAddingBiomarker && <AddNewBiomarker onCancel={() => setIsAddingBiomarker(false)} />}
                        <BiomarkersPanel searchQuery={biomarkerSearchQuery} />
                      </CollapsibleContent>
                    </Collapsible>
                </div>
              )}
            </div>

            
            <Separator />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-start">
                <div className="lg:col-span-3 flex flex-col gap-6">
                    <ReminderCard />
                </div>
            </div>
          </div>
        </main>
        <UnsavedChangesBar />
      </div>
      <EditDoctorDetailsDialog open={isEditingDoctor} onOpenChange={setIsEditingDoctor} />
    </TooltipProvider>
  );
}
