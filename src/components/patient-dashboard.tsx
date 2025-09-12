'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Stethoscope, Shapes, ArrowLeft, PlusCircle } from 'lucide-react';
import { PatientHeader } from '@/components/patient-header';
import { Separator } from '@/components/ui/separator';
import { DiseasePanel } from '@/components/disease-panel';
import { BiomarkersPanel } from '@/components/biomarkers-panel';
import { InsightsCard } from '@/components/insights-card';
import { ReminderCard } from '@/components/reminder-card';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { DashboardSectionToggle } from './dashboard-section-toggle';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { doctorDetails } from '@/lib/doctor-data';
import { EditDoctorDetailsDialog } from './edit-doctor-details-dialog';
import { TitleBar } from '@/components/ui/title-bar';
import { AddNewBiomarker } from './add-new-biomarker';
import { Logo } from './logo';
import { getEnabledCards } from '@/lib/biomarker-cards';

export function PatientDashboard() {
  const { isClient, isReadOnlyView, patient } = useApp();
  const router = useRouter();
  const [isDiseasePanelOpen, setIsDiseasePanelOpen] = React.useState(true);
  const [isBiomarkersOpen, setIsBiomarkersOpen] = React.useState(false);
  const [diseasePanelSearchQuery, setDiseasePanelSearchQuery] = React.useState('');
  const [biomarkerSearchQuery, setBiomarkerSearchQuery] = React.useState('');
  const [isEditingDoctor, setIsEditingDoctor] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isAddingBiomarker, setIsAddingBiomarker] = React.useState(false);

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
  
  const enabledCards = getEnabledCards(patient.enabledBiomarkers);

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

  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <TitleBar
          title={['Glycemic', 'Guardian']}
          subtitle={doctorDetails.name}
          onSubtitleClick={() => setIsEditingDoctor(true)}
          backButton={BackButton}
          isScrolled={isScrolled}
        />
        <main className="flex-1 p-4 md:p-6 pb-4">
          <div className="mx-auto grid w-full max-w-7xl gap-6">
            <PatientHeader />

            <Separator />
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {enabledCards.map((card, index) => (
                <React.Fragment key={index}>{card}</React.Fragment>
              ))}
               <div className="lg:col-span-2">
                    <InsightsCard />
                </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Collapsible open={isDiseasePanelOpen} onOpenChange={setIsDiseasePanelOpen}>
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

              {!isReadOnlyView && (
                <Collapsible open={isBiomarkersOpen} onOpenChange={setIsBiomarkersOpen}>
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
      </div>
      <EditDoctorDetailsDialog open={isEditingDoctor} onOpenChange={setIsEditingDoctor} />
    </>
  );
}
