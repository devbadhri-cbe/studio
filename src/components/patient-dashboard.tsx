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

export function PatientDashboard() {
  const { isClient, isReadOnlyView, patient } = useApp();
  const router = useRouter();
  const [isEditingDoctor, setIsEditingDoctor] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isShareOpen, setIsShareOpen] = React.useState(false);

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
              <ProfileCard />
              <MedicalHistoryCard />
            </div>
            <Separator />
          </div>
        </main>
      </div>
      <EditDoctorDetailsDialog open={isEditingDoctor} onOpenChange={setIsEditingDoctor} />
      {patient && <SharePatientAccessDialog open={isShareOpen} onOpenChange={setIsShareOpen} patient={patient} />}
    </>
  );
}
