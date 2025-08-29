
'use client';

import * as React from 'react';
import { ProfileCard } from '@/components/profile-card';
import { InsightsCard } from '@/components/insights-card';
import { ReminderCard } from '@/components/reminder-card';
import { useApp } from '@/context/app-context';
import { Hba1cCard } from '@/components/hba1c-card';
import { Logo } from '@/components/logo';
import { ClipboardList, Mail, Upload, User, Loader2, LayoutGrid, UploadCloud, GaugeCircle } from 'lucide-react';
import { LipidCard } from '@/components/lipid-card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { VitaminDCard } from '@/components/vitamin-d-card';
import { UploadRecordDialog } from '@/components/upload-record-dialog';
import { ReportCard } from '@/components/report-card';
import { ThyroidCard } from '@/components/thyroid-card';
import { HypertensionCard } from '@/components/hypertension-card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ThemeToggle } from '@/components/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { updatePatient } from '@/lib/firestore';

export default function PatientDashboard() {
  const { profile, setProfile, isClient, dashboardView, setDashboardView, isDoctorLoggedIn, doctorName } = useApp();
  const router = useRouter();
  const { toast } = useToast();

  const [isDoctor, setIsDoctor] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isTooltipOpen, setIsTooltipOpen] = React.useState(true);


  React.useEffect(() => {
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

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile.id) return;

    setIsUploading(true);
    try {
        const fileRef = ref(storage, `profile_photos/${profile.id}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(fileRef, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        
        await updatePatient(profile.id, { photoUrl: downloadUrl });
        setProfile({ ...profile, photoUrl: downloadUrl });
        
        toast({
            title: 'Photo Uploaded',
            description: 'Your profile picture has been updated.',
        });
    } catch (error) {
        console.error("Photo upload failed:", error);
        toast({
            variant: 'destructive',
            title: 'Upload Failed',
            description: 'Could not upload photo. Please try again.',
        });
    } finally {
        setIsUploading(false);
    }
  };

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
  
  const dashboardOptions = {
    hba1c: 'HbA1c Dashboard',
    lipids: 'Lipid Dashboard',
    vitaminD: 'Vitamin D Dashboard',
    thyroid: 'Thyroid Dashboard',
    hypertension: 'Hypertension Dashboard',
    report: 'Comprehensive Report',
  }
  
  const handleDropdownOpen = (isOpen: boolean) => {
    if (isOpen) {
      setIsTooltipOpen(false);
    }
  };


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
            <div className="flex items-stretch border-b pb-4 gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="relative rounded-full group shrink-0"
                    >
                        <Avatar className="h-24 w-24 cursor-pointer">
                            <AvatarImage src={profile.photoUrl} />
                            <AvatarFallback>
                                {isUploading ? <Loader2 className="h-8 w-8 animate-spin" /> : 
                                    <>
                                        <User className="h-10 w-10 text-muted-foreground group-hover:hidden" />
                                        <Upload className="h-10 w-10 text-muted-foreground hidden group-hover:block" />
                                    </>
                                }
                            </AvatarFallback>
                        </Avatar>
                    </button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Upload Photo</p>
                </TooltipContent>
              </Tooltip>
              <Input id="photo-upload" type="file" className="hidden" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-1">
                <div>
                  <h1 className="text-2xl md:text-3xl font-semibold font-headline">
                    {pageTitle}
                  </h1>
                  <p className="text-sm text-muted-foreground">Your health overview. Consult your doctor before making any decisions.</p>
                </div>
                <div className="flex w-full sm:w-auto items-center justify-end gap-2 shrink-0">
                  <UploadRecordDialog />
                   <DropdownMenu onOpenChange={handleDropdownOpen}>
                    <Tooltip open={isTooltipOpen} onOpenChange={setIsTooltipOpen}>
                        <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="outline" className={`w-9 h-9 p-0 ${isTooltipOpen ? 'animate-pulse-once bg-primary/20' : ''}`}>
                                    <GaugeCircle className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" align="end">
                            <p>Select a dashboard to view</p>
                        </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent>
                        {Object.entries(dashboardOptions).map(([key, value]) => (
                            <DropdownMenuItem 
                                key={key}
                                onSelect={() => setDashboardView(key as 'hba1c' | 'lipids' | 'vitaminD' | 'thyroid' | 'report' | 'hypertension')}
                                className={dashboardView === key ? 'bg-accent' : ''}
                            >
                                {value}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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
