

'use client';

import * as React from 'react';
import { ProfileCard } from '@/components/profile-card';
import { InsightsCard } from '@/components/insights-card';
import { ReminderCard } from '@/components/reminder-card';
import { useApp } from '@/context/app-context';
import { Hba1cCard } from '@/components/hba1c-card';
import { ArrowLeft, UploadCloud, LayoutGrid, GaugeCircle, Check, RefreshCw } from 'lucide-react';
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
import { WeightRecordCard } from '@/components/weight-record-card';
import { PatientHeader } from '@/components/patient-header';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UploadRecordDialog } from '@/components/upload-record-dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import type { LabResultUploadOutput } from '@/ai/flows/lab-result-upload';
import { UploadConfirmationForm } from '@/components/upload-confirmation-form';
import { DoctorReviewCard } from '@/components/doctor-review-card';
import { TitleBar } from '@/components/title-bar';


export default function PatientDashboard() {
  const { isClient, dashboardView, setDashboardView, isDoctorLoggedIn, profile, setProfile, dashboardSuggestions } = useApp();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [shouldAnimate, setShouldAnimate] = React.useState(false);
  const [extractedData, setExtractedData] = React.useState<LabResultUploadOutput | null>(null);

  const hasPendingReview = (profile.presentMedicalConditions.some(c => c.status === 'pending_review') || dashboardSuggestions.some(s => s.status === 'pending'));
  
  React.useEffect(() => {
    if (isMobile && dashboardView === 'none') {
        const timer = setTimeout(() => {
            setShouldAnimate(true);
        }, 500); // Small delay to ensure page is settled
        
        const clearTimer = setTimeout(() => {
            setShouldAnimate(false);
        }, 2500); // Animation is 2s, give it a bit more time

        return () => {
            clearTimeout(timer);
            clearTimeout(clearTimer);
        }
    }
  }, [isMobile, dashboardView]);


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


  const renderDashboard = () => {
    switch (dashboardView) {
      case 'hba1c':
        return <Hba1cCard />;
      case 'lipids':
        return <LipidCard />;
      case 'vitaminD':
        return <VitaminDCard />;
      case 'thyroid':
        return <ThyroidCard />;
      case 'hypertension':
        return <HypertensionCard />;
      case 'renal':
        return <RenalCard />;
      default:
        return null;
    }
  }
  
   const dashboardOptions = {
    hba1c: { name: 'HbA1c Dashboard', icon: <GaugeCircle className="w-4 h-4" /> },
    lipids: { name: 'Lipid Dashboard', icon: <GaugeCircle className="w-4 h-4" /> },
    vitaminD: { name: 'Vitamin D Dashboard', icon: <GaugeCircle className="w-4 h-4" /> },
    thyroid: { name: 'Thyroid Dashboard', icon: <GaugeCircle className="w-4 h-4" /> },
    hypertension: { name: 'Hypertension Dashboard', icon: <GaugeCircle className="w-4 h-4" /> },
    renal: { name: 'Renal Dashboard', icon: <GaugeCircle className="w-4 h-4" /> },
  }
  
  const handleDashboardSelect = (key: string) => {
    setDashboardView(key as 'hba1c' | 'lipids' | 'vitaminD' | 'thyroid' | 'report' | 'hypertension' | 'renal' | 'none');
  }
  
  const ActiveDashboardIcon = dashboardView !== 'none' && dashboardView !== 'report' ? dashboardOptions[dashboardView as keyof typeof dashboardOptions]?.icon : <GaugeCircle className="w-4 h-4" />;
  const dashboardButtonLabel = dashboardView !== 'none' && dashboardView !== 'report' ? dashboardOptions[dashboardView as keyof typeof dashboardOptions].name : "Select a Dashboard";


  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col bg-background">
         <TitleBar>
            {isDoctorLoggedIn && (
                <Tooltip>
                    <TooltipTrigger asChild>
                    <Button onClick={() => router.push('/doctor/dashboard')} size="sm" variant="ghost" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Patient List
                    </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                    <p>Return to Patient List</p>
                    </TooltipContent>
                </Tooltip>
            )}
         </TitleBar>

        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto grid w-full max-w-7xl gap-6">
             {isDoctorLoggedIn && hasPendingReview && <DoctorReviewCard />}

            <div className="space-y-6">
              <PatientHeader />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProfileCard />
                <WeightRecordCard />
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
               <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className={cn("justify-center", shouldAnimate && 'animate-pulse-once bg-primary/20')}>
                            {ActiveDashboardIcon}
                            <span className="ml-2">{dashboardButtonLabel}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {isDoctorLoggedIn ? (
                            <>
                                <DropdownMenuLabel>Manage Dashboards</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {Object.entries(dashboardOptions).map(([key, value]) => (
                                    <DropdownMenuCheckboxItem
                                        key={key}
                                        checked={profile.enabledDashboards?.includes(key)}
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            const currentDashboards = profile.enabledDashboards || [];
                                            const isEnabled = currentDashboards.includes(key);
                                            let updatedDashboards: string[];
                                            if (isEnabled) {
                                                updatedDashboards = currentDashboards.filter(d => d !== key);
                                            } else {
                                                updatedDashboards = [...currentDashboards, key];
                                            }
                                            setProfile({ ...profile, enabledDashboards: updatedDashboards });
                                        }}
                                    >
                                        {value.icon}
                                        <span className="ml-2">{value.name}</span>
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </>
                        ) : (
                             <>
                                <DropdownMenuLabel>Select Dashboard</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {(profile.enabledDashboards || []).map((key) => {
                                    const dashboard = dashboardOptions[key as keyof typeof dashboardOptions];
                                    if (!dashboard) return null;
                                    return (
                                        <DropdownMenuItem key={key} onSelect={() => handleDashboardSelect(key)}>
                                            {dashboard.icon}
                                            <span className="ml-2">{dashboard.name}</span>
                                        </DropdownMenuItem>
                                    )
                                })}
                                {(profile.enabledDashboards?.length === 0) && (
                                     <DropdownMenuItem disabled>No dashboards enabled.</DropdownMenuItem>
                                )}
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
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
                    {dashboardView !== 'none' && dashboardView !== 'report' && renderDashboard()}
                    <InsightsCard />
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
