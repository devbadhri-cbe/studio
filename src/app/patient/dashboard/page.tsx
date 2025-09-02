

'use client';

import * as React from 'react';
import { ProfileCard } from '@/components/profile-card';
import { InsightsCard } from '@/components/insights-card';
import { ReminderCard } from '@/components/reminder-card';
import { useApp } from '@/context/app-context';
import { ArrowLeft, UploadCloud } from 'lucide-react';
import { LipidCard } from '@/components/lipid-card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { VitaminDCard } from '@/components/vitamin-d-card';
import { ReportCard } from '@/components/report-card';
import { ThyroidCard } from '@/components/thyroid-card';
import { HypertensionCard } from '@/components/hypertension-card';
import { RenalCard } from '@/components/renal-card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MedicalConditionsCard } from '@/components/medical-conditions-card';
import { MedicationCard } from '@/components/medication-card';
import { PatientHeader } from '@/components/patient-header';
import { Separator } from '@/components/ui/separator';
import { UploadRecordDialog } from '@/components/upload-record-dialog';
import type { LabResultUploadOutput } from '@/ai/flows/lab-result-upload';
import { UploadConfirmationForm } from '@/components/upload-confirmation-form';
import { DoctorReviewCard } from '@/components/doctor-review-card';
import { TitleBar } from '@/components/title-bar';
import { EditHeightDialog, type EditHeightDialogHandles } from '@/components/edit-height-dialog';
import { BiomarkersCard } from '@/components/biomarkers-card';
import { Hba1cCard } from '@/components/hba1c-card';


export default function PatientDashboard() {
  const { isClient, isDoctorLoggedIn, profile, dashboardSuggestions, enabledDashboards } = useApp();
  const router = useRouter();
  const [extractedData, setExtractedData] = React.useState<LabResultUploadOutput | null>(null);
  const editHeightDialogRef = React.useRef<EditHeightDialogHandles>(null);

  const hasPendingReview = (profile.presentMedicalConditions.some(c => c.status === 'pending_review') || dashboardSuggestions.some(s => s.status === 'pending'));
  
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
  
  const handleExtractionComplete = (data: LabResultUploadOutput) => {
    setExtractedData(data);
  };

  const handleConfirmationCancel = () => {
    setExtractedData(null);
  };

  const handleConfirmationSuccess = () => {
    setExtractedData(null);
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col bg-background">
         <TitleBar>
            {isDoctorLoggedIn && (
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
            )}
         </TitleBar>

        <main className="flex-1 p-4 md:pt-10 md:p-6">
          <div className="mx-auto grid w-full max-w-7xl gap-6">
             {isDoctorLoggedIn && hasPendingReview && <DoctorReviewCard />}

            <div className="space-y-6">
              <PatientHeader />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProfileCard />
                <MedicalConditionsCard />
                <MedicationCard />
              </div>
            </div>
            
            <Separator />

             <div className="flex w-full flex-wrap justify-center gap-2">
              <UploadRecordDialog onExtractionComplete={handleExtractionComplete}>
                <Button variant="outline">
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Upload Result
                </Button>
              </UploadRecordDialog>
            </div>
            
             {extractedData && (
              <UploadConfirmationForm 
                extractedData={extractedData}
                onCancel={handleConfirmationCancel}
                onSuccess={handleConfirmationSuccess}
              />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-start">
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <ReminderCard />
                </div>
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <InsightsCard />
                </div>
            </div>
            
            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {isDoctorLoggedIn && <BiomarkersCard />}
                 {enabledDashboards?.includes('hba1c') && <Hba1cCard />}
                 {enabledDashboards?.includes('lipids') && <LipidCard />}
                 {enabledDashboards?.includes('vitaminD') && <VitaminDCard />}
                 {enabledDashboards?.includes('thyroid') && <ThyroidCard />}
                 {enabledDashboards?.includes('hypertension') && <HypertensionCard />}
                 {enabledDashboards?.includes('renal') && <RenalCard />}
            </div>

            <Separator />
            
            <div className="printable-area">
                <ReportCard />
            </div>
            
          </div>
        </main>
      </div>
      <EditHeightDialog ref={editHeightDialogRef} />
    </TooltipProvider>
  );
}
