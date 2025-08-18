'use client';

import * as React from 'react';
import { ProfileCard } from '@/components/profile-card';
import { InsightsCard } from '@/components/insights-card';
import { ReminderCard } from '@/components/reminder-card';
import { useApp } from '@/context/app-context';
import { PrintableReport } from '@/components/printable-report';
import { Hba1cCard } from '@/components/hba1c-card';
import { Logo } from '@/components/logo';
import { Mail, Phone } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LipidCard } from '@/components/lipid-card';

export default function Home() {
  const { profile, isClient, dashboardView, setDashboardView } = useApp();

  if (!isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-background no-print">
        <header className="border-b px-4 py-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Logo className="h-8 w-8 text-primary" />
              <span className="text-3xl font-bold md:text-4xl font-headline">Health Guardian</span>
            </div>
             <div className="flex items-center gap-4">
              <div className="text-right text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Dr. Badhrinathan N</p>
                <a href="mailto:drbadhri@gmail.com" className="flex items-center justify-end gap-1.5 hover:text-primary">
                  <Mail className="h-3 w-3" />
                  drbadhri@gmail.com
                </a>
                <a href="tel:+919791377716" className="flex items-center justify-end gap-1.5 hover:text-primary">
                  <Phone className="h-3 w-3" />
                  +91 97913 77716
                </a>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto grid w-full max-w-7xl gap-6">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold font-headline">
                  Welcome, {profile.name || 'User'}!
                </h1>
                <p className="text-muted-foreground">Here is your health dashboard for today. Always consult with your clinician before acting on the suggestions below.</p>
              </div>
              <div className="w-[180px]">
                <Select value={dashboardView} onValueChange={(value) => setDashboardView(value as 'hba1c' | 'lipids')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hba1c">HbA1c Dashboard</SelectItem>
                    <SelectItem value="lipids">Lipid Dashboard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <ReminderCard />
              <div className="lg:col-span-2">
                <InsightsCard />
              </div>
            </div>
            <div className="grid auto-rows-fr grid-cols-1 gap-6 lg:grid-cols-3">
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
      <PrintableReport />
    </>
  );
}
