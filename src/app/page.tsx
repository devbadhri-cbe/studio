'use client';

import * as React from 'react';
import { ProfileCard } from '@/components/profile-card';
import { InsightsCard } from '@/components/insights-card';
import { ReminderCard } from '@/components/reminder-card';
import { useApp } from '@/context/app-context';
import { PrintableReport } from '@/components/printable-report';
import { Hba1cCard } from '@/components/hba1c-card';
import { Logo } from '@/components/logo';

export default function Home() {
  const { profile, isClient } = useApp();

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
        <header className="py-4">
          <div className="flex items-center justify-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-2xl md:text-3xl font-semibold font-headline">Glycemic Guardian</span>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto grid w-full max-w-7xl gap-6">
            <div className="border-b pb-2">
              <h1 className="text-2xl md:text-3xl font-semibold font-headline">
                Welcome, {profile.name || 'User'}!
              </h1>
              <p className="text-muted-foreground">Here is your health dashboard for today.</p>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <ReminderCard />
              <div className="lg:col-span-2">
                <InsightsCard />
              </div>
            </div>
            <div className="grid auto-rows-fr grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Hba1cCard />
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
