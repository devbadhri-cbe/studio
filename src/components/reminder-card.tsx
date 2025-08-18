'use client';

import { useApp } from '@/context/app-context';
import { differenceInMonths, formatDistanceToNow, addMonths, format, differenceInYears, addYears } from 'date-fns';
import { Bell, CheckCircle2, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function ReminderCard() {
  const { records, lipidRecords, dashboardView, profile } = useApp();

  let content;
  const hasMedicalConditions = !!profile.presentMedicalConditions;

  if (dashboardView === 'hba1c') {
    const sortedRecords = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastRecord = sortedRecords[0];

    if (!lastRecord) {
      content = {
        icon: <Bell className="h-6 w-6 text-yellow-500" />,
        title: 'Time for your first HbA1c test!',
        description: 'Add your first HbA1c record to start tracking your health.',
        color: 'bg-yellow-500/10',
      };
    } else {
      const lastTestDate = new Date(lastRecord.date);
      const lastTestValue = lastRecord.value;
      
      let status = 'Healthy';
      let retestMonths = 36;
      
      if (lastTestValue >= 5.7 && lastTestValue <= 6.4) {
        status = 'Prediabetes';
        retestMonths = 12; // Yearly
      } else if (lastTestValue >= 6.5) {
        status = 'Diabetes';
        retestMonths = 4; // Every 3-4 months
      } else if (hasMedicalConditions) {
        // Healthy range, but with medical conditions, recommend more frequent checks
        retestMonths = 12; // Yearly
      }

      const monthsSinceLastTest = differenceInMonths(new Date(), lastTestDate);
      const nextTestDate = addMonths(lastTestDate, retestMonths);
      const baseDescription = `Based on your last result (${status}), it's recommended to test every ${retestMonths} months. Your last test was ${formatDistanceToNow(lastTestDate)} ago.`;
      const conditionDescription = hasMedicalConditions ? "Your medical history suggests more frequent monitoring. " : "";

      if (monthsSinceLastTest >= retestMonths) {
         content = {
          icon: <Bell className="h-6 w-6 text-destructive" />,
          title: 'Reminder: Time for your test!',
          description: `${conditionDescription}${baseDescription}`,
          color: 'bg-destructive/10',
        };
      } else {
         content = {
          icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
          title: 'You are on track!',
          description: `With a status of "${status}", your next recommended HbA1c test is around ${format(nextTestDate, 'MMMM yyyy')}.`,
          color: 'bg-green-500/10',
        };
      }
    }
  } else { // Lipid view
    const sortedLipidRecords = [...lipidRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastLipidRecord = sortedLipidRecords[0];

    if (!lastLipidRecord) {
      content = {
        icon: <Heart className="h-6 w-6 text-yellow-500" />,
        title: 'Time for your first lipid panel!',
        description: 'Add your first lipid record to start tracking your cardiovascular health.',
        color: 'bg-yellow-500/10',
      };
    } else {
      const lastTestDate = new Date(lastLipidRecord.date);
      // More nuanced guideline: check every 5 years for healthy adults, but annually if risks.
      const retestYears = hasMedicalConditions ? 1 : 5; 
      const yearsSinceLastTest = differenceInYears(new Date(), lastTestDate);
      const nextTestDate = addYears(lastTestDate, retestYears);
      const conditionDescription = hasMedicalConditions ? "Due to your medical history, annual checks are advised. " : "";

      if (yearsSinceLastTest >= retestYears) {
        content = {
          icon: <Heart className="h-6 w-6 text-destructive" />,
          title: 'Reminder: Time for your lipid panel!',
          description: `${conditionDescription}It's recommended to check lipids every ${retestYears === 1 ? 'year' : `${retestYears} years`}. Your last test was ${formatDistanceToNow(lastTestDate)} ago.`,
          color: 'bg-destructive/10',
        };
      } else {
        content = {
          icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
          title: 'You are on track!',
          description: `Your next recommended lipid panel is around ${format(nextTestDate, 'MMMM yyyy')}. Consult your doctor for personalized advice.`,
          color: 'bg-green-500/10',
        };
      }
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${content.color}`}>
            {content.icon}
          </div>
          <CardTitle>Testing Reminder</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-semibold">{content.title}</p>
        <p className="text-sm text-muted-foreground">{content.description}</p>
      </CardContent>
    </Card>
  );
}
