
'use client';

import * as React from 'react';
import { ProfileCard } from '@/components/profile-card';
import { InsightsCard } from '@/components/insights-card';
import { ReminderCard } from '@/components/reminder-card';
import { useApp } from '@/context/app-context';
import { Hba1cCard } from '@/components/hba1c-card';
import { Logo } from '@/components/logo';
import { ClipboardList, Mail } from 'lucide-react';
import { LipidCard } from '@/components/lipid-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { VitaminDCard } from '@/components/vitamin-d-card';
import { UploadRecordDialog } from '@/components/upload-record-dialog';
import { ReportCard } from '@/components/report-card';
import { ThyroidCard } from '@/components/thyroid-card';
import { HypertensionCard } from '@/components/hypertension-card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ThemeToggle } from '@/components/theme-toggle';

export default function PatientDashboard() {
  const { profile, isClient, dashboardView, setDashboardView, isDoctorLoggedIn, doctorName } = useApp();
  const router = useRouter();
  
  // Use a separate state to track doctor login status on the client
  const [isDoctor, setIsDoctor] = React.useState(false);

  React.useEffect(() => {
    // This ensures we check the actual login status from context and local storage
    const doctorStatus = isDoctorLoggedIn || localStorage.getItem('doctor_logged_in') === 'true';
    setIsDoctor(doctorStatus);
  }, [isDoctorLoggedIn]);


  if (!isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  
  const pageTitle = isDoctor 
    ? `${profile.name}'s Dashboard` 
    : `Welcome, ${profile.name || 'User'}!`;

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
        return <Hba1cCard />;
    }
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col bg-background">
         <header className="border-b px-4 md:px-6">
            <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-2">
              <div className="w-full flex justify-center py-6">
                <div className="flex items-center gap-2">
                    <Logo className="h-8 w-8 text-primary" />
                    <span className="text-3xl font-bold md:text-4xl font-headline">Health Guardian</span>
                </div>
              </div>

             {isDoctor && (
                <div className="w-full flex items-center justify-between text-sm text-muted-foreground pb-4">
                    <div>
                        <p className="font-semibold text-foreground">{doctorName}</p>
                        <a href="mailto:drbadhri@gmail.com" className="flex items-center gap-1.5 hover:text-primary">
                            <Mail className="h-3 w-3" />
                            drbadhri@gmail.com
                        </a>
                    </div>
                     <div className="flex items-center gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                            <Button onClick={() => router.push('/doctor/dashboard')} size="icon" variant="outline">
                                <ClipboardList className="h-4 w-4" />
                                <span className="sr-only">Patient List</span>
                            </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                            <p>Patient List</p>
                            </TooltipContent>
                        </Tooltip>
                        <ThemeToggle />
                    </div>
                </div>
            )}
            </div>
      </header>
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto grid w-full max-w-7xl gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-2 gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold font-headline">
                  {pageTitle}
                </h1>
                <p className="text-muted-foreground">Here is your health dashboard. Always consult with your clinician before acting on the suggestions below.</p>
              </div>
              <div className="flex w-full sm:w-auto items-center justify-end gap-2">
                <UploadRecordDialog />
                <Select value={dashboardView} onValueChange={(value) => setDashboardView(value as 'hba1c' | 'lipids' | 'vitaminD' | 'thyroid' | 'report' | 'hypertension')}>
                  <SelectTrigger className="w-auto flex-1 sm:flex-initial h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hba1c">HbA1c Dashboard</SelectItem>
                    <SelectItem value="lipids">Lipid Dashboard</SelectItem>
                    <SelectItem value="vitaminD">Vitamin D Dashboard</SelectItem>
                    <SelectItem value="thyroid">Thyroid Dashboard</SelectItem>
                    <SelectItem value="hypertension">Hypertension Dashboard</SelectItem>
                    <SelectItem value="report">Comprehensive Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <ProfileCard />
                </div>
                <div className="lg:col-span-2">
                    <InsightsCard />
                </div>
            </div>
            
            <div className="grid auto-rows-fr grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="lg:col-span-2">
                {renderDashboard()}
              </div>
              <div className="lg:col-span-1">
                 <ReminderCard />
              </div>
            </div>

          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
