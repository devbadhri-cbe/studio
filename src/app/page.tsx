
'use client';

import * as React from 'react';
import { ProfileCard } from '@/components/profile-card';
import { InsightsCard } from '@/components/insights-card';
import { ReminderCard } from '@/components/reminder-card';
import { useApp } from '@/context/app-context';
import { Hba1cCard } from '@/components/hba1c-card';
import { Logo } from '@/components/logo';
import { Mail, Phone } from 'lucide-react';
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
import { PrintableReport } from '@/components/printable-report';
import { ShareButton } from '@/components/share-button';

export default function Home() {
  const { profile, isClient, dashboardView, setDashboardView, isDoctorLoggedIn, doctorName } = useApp();
  const router = useRouter();

  if (!isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  
  const pageTitle = isDoctorLoggedIn 
    ? `${profile.name}'s Dashboard` 
    : `Welcome, ${profile.name || 'User'}!`;

  return (
    <>
      <div className="main-content no-print">
        <div className="flex min-h-screen w-full flex-col bg-background">
          <header className="border-b px-4 py-4 md:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Logo className="h-8 w-8 text-primary" />
                <span className="text-3xl font-bold md:text-4xl font-headline">Health Guardian</span>
              </div>
              <div className="flex items-center gap-4">
                {isDoctorLoggedIn ? (
                    <div className="text-right text-sm text-muted-foreground">
                        <p className="font-semibold text-foreground">{doctorName}</p>
                        <a href="mailto:drbadhri@gmail.com" className="flex items-center justify-end gap-1.5 hover:text-primary">
                            <Mail className="h-3 w-3" />
                            drbadhri@gmail.com
                        </a>
                        <a href="tel:+919791377716" className="flex items-center justify-end gap-1.5 hover:text-primary">
                            <Phone className="h-3 w-3" />
                            +91 9791377716
                        </a>
                    </div>
                ) : <Button onClick={() => router.push('/doctor/login')}>Doctor Portal</Button>}
              </div>
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
                  {isDoctorLoggedIn && <Button onClick={() => router.push('/doctor/dashboard')} className="flex-1 sm:flex-initial">Back to Patient List</Button>}
                  <Select value={dashboardView} onValueChange={(value) => setDashboardView(value as 'hba1c' | 'lipids')}>
                    <SelectTrigger className="w-auto flex-1 sm:flex-initial">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hba1c">HbA1c Dashboard</SelectItem>
                      <SelectItem value="lipids">Lipid Dashboard</SelectItem>
                    </SelectContent>
                  </Select>
                  <ShareButton />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="md:col-span-2 lg:col-span-1">
                   <ReminderCard />
                </div>
                <div className="md:col-span-2">
                  <InsightsCard />
                </div>
              </div>
              <div className="grid auto-rows-fr grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {dashboardView === 'hba1c' ? <Hba1cCard /> : <LipidCard />}
                </div>
                <div className="lg:col-span-1">
                  <ProfileCard />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="print-only">
        <PrintableReport />
      </div>
    </>
  );
}
