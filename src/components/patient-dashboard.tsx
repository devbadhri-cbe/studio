

'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Stethoscope, Shapes, Search, ArrowLeft } from 'lucide-react';
import { MedicalHistoryCard } from '@/components/medical-history-card';
import { PatientHeader } from '@/components/patient-header';
import { Separator } from '@/components/ui/separator';
import { TitleBar } from '@/components/ui/title-bar';
import { DiseasePanel } from '@/components/disease-panel';
import { BiomarkersPanel } from '@/components/biomarkers-panel';
import { InsightsCard } from '@/components/insights-card';
import { ReminderCard } from '@/components/reminder-card';
import { ProfileCard } from '@/components/profile-card';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Input } from './ui/input';
import { UnsavedChangesBar } from './unsaved-changes-bar';
import { DashboardSectionToggle } from './dashboard-section-toggle';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { doctorDetails } from '@/lib/doctor-data';
import { EditDoctorDetailsDialog } from './edit-doctor-details-dialog';


export function PatientDashboard() {
  const { isClient, isDoctorLoggedIn } = useApp();
  const router = useRouter();
  const [isDiseasePanelOpen, setIsDiseasePanelOpen] = React.useState(false);
  const [isBiomarkersOpen, setIsBiomarkersOpen] = React.useState(false);
  const [diseasePanelSearchQuery, setDiseasePanelSearchQuery] = React.useState('');
  const [biomarkerSearchQuery, setBiomarkerSearchQuery] = React.useState('');
  const [isEditingDoctor, setIsEditingDoctor] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  const headerSeparatorRef = React.useRef<HTMLDivElement>(null);
  
   React.useEffect(() => {
    const handleScroll = () => {
      if (headerSeparatorRef.current) {
        // The point at which the glass effect should start.
        // 100 is an approximation of the initial TitleBar height.
        const triggerPoint = headerSeparatorRef.current.offsetTop - 100;
        setIsScrolled(window.scrollY > triggerPoint);
      } else {
        // Fallback for when the separator isn't rendered
        setIsScrolled(window.scrollY > 50);
      }
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
        <main className="flex-1 p-4 md:pt-10 md:p-6 pb-24">
          <div className="mx-auto grid w-full max-w-7xl gap-6">
             
            <PatientHeader />
            
            <div ref={headerSeparatorRef}>
                <Separator />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <ProfileCard />
                </div>
                 <div className="lg:col-span-2 grid grid-cols-1 gap-6">
                     <MedicalHistoryCard />
                </div>
            </div>
            
            <Separator />
            
            <div className="flex flex-col gap-4">
                <Collapsible open={isDiseasePanelOpen} onOpenChange={setIsDiseasePanelOpen}>
                    <DashboardSectionToggle
                        title="Disease Panels"
                        icon={<Stethoscope className="h-5 w-5" />}
                        isOpen={isDiseasePanelOpen}
                    >
                        {isDiseasePanelOpen && (
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search panels..."
                                    value={diseasePanelSearchQuery}
                                    onChange={(e) => setDiseasePanelSearchQuery(e.target.value)}
                                    className="pl-8 h-full"
                                />
                            </div>
                        )}
                    </DashboardSectionToggle>
                    <CollapsibleContent className="mt-4">
                        <DiseasePanel searchQuery={diseasePanelSearchQuery} />
                    </CollapsibleContent>
                </Collapsible>
                
                <Collapsible open={isBiomarkersOpen} onOpenChange={setIsBiomarkersOpen}>
                    <DashboardSectionToggle
                        title="Biomarker Cards"
                        icon={<Shapes className="h-5 w-5" />}
                        isOpen={isBiomarkersOpen}
                    >
                         {isBiomarkersOpen && (
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search biomarkers..."
                                    value={biomarkerSearchQuery}
                                    onChange={(e) => setBiomarkerSearchQuery(e.target.value)}
                                    className="pl-8 h-full"
                                />
                            </div>
                        )}
                    </DashboardSectionToggle>
                    <CollapsibleContent className="mt-4">
                        <BiomarkersPanel searchQuery={biomarkerSearchQuery} />
                    </CollapsibleContent>
                </Collapsible>
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
          </div>
        </main>
        <UnsavedChangesBar />
      </div>
      <EditDoctorDetailsDialog open={isEditingDoctor} onOpenChange={setIsEditingDoctor} />
    </TooltipProvider>
  );
}
