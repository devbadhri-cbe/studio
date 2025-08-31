
'use client';

import * as React from 'react';
import { ProfileCard } from '@/components/profile-card';
import { InsightsCard } from '@/components/insights-card';
import { ReminderCard } from '@/components/reminder-card';
import { useApp } from '@/context/app-context';
import { Hba1cCard } from '@/components/hba1c-card';
import { ArrowLeft, UploadCloud, LayoutGrid, GaugeCircle } from 'lucide-react';
import { LipidCard } from '@/components/lipid-card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { VitaminDCard } from '@/components/vitamin-d-card';
import { ReportCard } from '@/components/report-card';
import { ThyroidCard } from '@/components/thyroid-card';
import { HypertensionCard } from '@/components/hypertension-card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TitleBar } from '@/components/title-bar';
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
} from '@/components/ui/dropdown-menu';
import { UploadRecordDialog } from '@/components/upload-record-dialog';


export default function PatientDashboard() {
  const { isClient, dashboardView, setDashboardView, isDoctorLoggedIn, doctorName } = useApp();
  const router = useRouter();
  const [isTooltipOpen, setIsTooltipOpen] = React.useState(false);


  if (!isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
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
      case 'report':
        return <ReportCard />;
      default:
        return null;
    }
  }
  
   const dashboardOptions = {
    report: { name: 'Comprehensive Report', icon: <LayoutGrid className="w-4 h-4" /> },
    hba1c: { name: 'HbA1c Dashboard', icon: <GaugeCircle className="w-4 h-4" /> },
    lipids: { name: 'Lipid Dashboard', icon: <GaugeCircle className="w-4 h-4" /> },
    vitaminD: { name: 'Vitamin D Dashboard', icon: <GaugeCircle className="w-4 h-4" /> },
    thyroid: { name: 'Thyroid Dashboard', icon: <GaugeCircle className="w-4 h-4" /> },
    hypertension: { name: 'Hypertension Dashboard', icon: <GaugeCircle className="w-4 h-4" /> },
  }
  
  const handleDashboardSelect = (key: string) => {
    setDashboardView(key as 'hba1c' | 'lipids' | 'vitaminD' | 'thyroid' | 'report' | 'hypertension' | 'none');
    setIsTooltipOpen(false);
  }
  
  const ActiveDashboardIcon = dashboardView !== 'none' ? dashboardOptions[dashboardView]?.icon : <GaugeCircle className="w-4 h-4" />;
  const dashboardButtonLabel = dashboardView !== 'none' ? dashboardOptions[dashboardView].name : "Select a Dashboard";


  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col bg-background">
         <TitleBar doctorName={doctorName} doctorEmail={'drbadhri@gmail.com'}>
            {isDoctorLoggedIn && (
                 <div className="absolute top-4 left-4">
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <Button onClick={() => router.push('/doctor/dashboard')} size="icon" variant="ghost">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="sr-only">Back to Patient List</span>
                        </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                        <p>Patient List</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            )}
         </TitleBar>
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto grid w-full max-w-7xl gap-6">
            <div className="space-y-6">
              <PatientHeader />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProfileCard />
                <WeightRecordCard />
              </div>
            </div>
            
            <Separator />

             <div className="flex w-full flex-wrap justify-center gap-2">
              <UploadRecordDialog>
                <Button variant="outline">
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Upload Result
                </Button>
              </UploadRecordDialog>
              <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className={`justify-center ${isTooltipOpen ? 'animate-pulse-once bg-primary/20' : ''}`}>
                            {ActiveDashboardIcon}
                            <span className="ml-2">{dashboardButtonLabel}</span>
                        </Button>
                    </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {Object.entries(dashboardOptions).map(([key, value]) => (
                        <DropdownMenuItem 
                            key={key}
                            onSelect={() => handleDashboardSelect(key)}
                            className={dashboardView === key ? 'bg-accent' : ''}
                        >
                            {value.icon}
                            <span className="ml-2">{value.name}</span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-start">
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <MedicalConditionsCard />
                    <MedicationCard />
                    <ReminderCard />
                </div>
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <InsightsCard />
                    {dashboardView !== 'none' && renderDashboard()}
                </div>
            </div>
            
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
