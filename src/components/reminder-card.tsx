
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { differenceInMonths, formatDistanceToNow, addMonths, format, differenceInYears, addYears } from 'date-fns';
import { Bell, CheckCircle2, Heart, Activity, Zap, Flame } from 'lucide-react';
import { calculateAge } from '@/lib/utils';
import { Separator } from './ui/separator';
import { UniversalCard } from './universal-card';
import type { ReactNode } from 'react';

export function ReminderCard() {
  const { fastingBloodGlucoseRecords, bloodPressureRecords, totalCholesterolRecords, thyroidRecords, profile } = useApp();

  if (!profile) return null;

  const { presentMedicalConditions, dob, diseasePanels } = profile;
  const hasMedicalConditions = presentMedicalConditions && presentMedicalConditions.length > 0;
  const age = calculateAge(dob);
  
  const reminders: ReactNode[] = [];

  // Diabetes (Fasting Glucose) Reminder
  const isGlucoseEnabled = diseasePanels?.diabetes?.glucose;
  if (isGlucoseEnabled) {
    const sortedFastingBloodGlucoseRecords = [...(fastingBloodGlucoseRecords || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastFastingBloodGlucoseRecord = sortedFastingBloodGlucoseRecords[0];
    let fastingBloodGlucoseContent;

    if (!lastFastingBloodGlucoseRecord) {
      fastingBloodGlucoseContent = {
        icon: <Heart className="h-5 w-5 text-yellow-500" />,
        title: 'Time for your first Fasting Glucose test!',
        description: 'Add a record to start tracking.',
        color: 'bg-yellow-500/10',
      };
    } else {
      const lastTestDate = new Date(lastFastingBloodGlucoseRecord.date);
      const lastTestValue = lastFastingBloodGlucoseRecord.value;
      
      let retestMonths = 36; // Default 3 years
      if (lastTestValue >= 100 && lastTestValue <= 125) retestMonths = 12; // Yearly for prediabetes
      else if (lastTestValue > 125) retestMonths = 4; // Every 3-4 months for diabetes
      else if (hasMedicalConditions || (age && age > 45)) retestMonths = 12; // Yearly for risk factors

      const monthsSinceLastTest = differenceInMonths(new Date(), lastTestDate);
      const nextTestDate = addMonths(lastTestDate, retestMonths);
      
      if (monthsSinceLastTest >= retestMonths) {
        fastingBloodGlucoseContent = {
          icon: <Heart className="h-5 w-5 text-destructive" />,
          title: 'Fasting Glucose Test Due',
          description: `Last test was ${formatDistanceToNow(lastTestDate)} ago. Retesting is recommended.`,
          color: 'bg-destructive/10',
        };
      } else {
        fastingBloodGlucoseContent = {
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
          title: 'Fasting Glucose On Track',
          description: `Next test is around ${format(nextTestDate, 'MMM yyyy')}.`,
          color: 'bg-green-500/10',
        };
      }
    }
    reminders.push(
      <div key="fbg" className="flex items-center gap-4">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${fastingBloodGlucoseContent.color}`}>
            {fastingBloodGlucoseContent.icon}
        </div>
        <div>
            <p className="font-semibold">{fastingBloodGlucoseContent.title}</p>
            <p className="text-sm text-muted-foreground">{fastingBloodGlucoseContent.description}</p>
        </div>
      </div>
    );
  }

  // Blood Pressure Reminder
  const isBloodPressureEnabled = diseasePanels?.hypertension?.bloodPressure;
  if (isBloodPressureEnabled) {
    const sortedBloodPressureRecords = [...(bloodPressureRecords || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastBloodPressureRecord = sortedBloodPressureRecords[0];
    let bloodPressureContent;

    if (!lastBloodPressureRecord) {
        bloodPressureContent = {
            icon: <Zap className="h-5 w-5 text-yellow-500" />,
            title: 'Time for your first BP check!',
            description: 'Add a record to start tracking.',
            color: 'bg-yellow-500/10',
        };
    } else {
      const { systolic, diastolic, date } = lastBloodPressureRecord;
      const lastTestDate = new Date(date);
      
      if (systolic >= 130 || diastolic >= 80) {
        bloodPressureContent = {
          icon: <Zap className="h-5 w-5 text-destructive" />,
          title: 'Follow Up on Blood Pressure',
          description: 'Your last reading was elevated. Please consult your doctor.',
          color: 'bg-destructive/10',
        };
      } else {
        const yearsSinceLastTest = differenceInYears(new Date(), lastTestDate);
        if (yearsSinceLastTest >= 1) {
            bloodPressureContent = {
                icon: <Zap className="h-5 w-5 text-yellow-500" />,
                title: 'Annual BP Check Due',
                description: `Last check was over a year ago. Time for your annual check-up.`,
                color: 'bg-yellow-500/10',
            };
        } else {
            bloodPressureContent = {
                icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
                title: 'Blood Pressure On Track',
                description: `Your next annual check is around ${format(addYears(lastTestDate, 1), 'MMM yyyy')}.`,
                color: 'bg-green-500/10',
            };
        }
      }
    }
     reminders.push(
      <div key="bp" className="flex items-center gap-4">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${bloodPressureContent.color}`}>
            {bloodPressureContent.icon}
        </div>
        <div>
            <p className="font-semibold">{bloodPressureContent.title}</p>
            <p className="text-sm text-muted-foreground">{bloodPressureContent.description}</p>
        </div>
      </div>
    );
  }

  // Lipid Panel Reminder
  const isLipidPanelEnabled = Object.values(diseasePanels?.lipidPanel || {}).some(Boolean);
  if (isLipidPanelEnabled) {
    const sortedLipidRecords = [...(totalCholesterolRecords || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastLipidRecord = sortedLipidRecords[0];
    let lipidContent;

    if (!lastLipidRecord) {
        lipidContent = {
            icon: <Flame className="h-5 w-5 text-yellow-500" />,
            title: 'Time for your first Lipid Panel!',
            description: 'Add a record to start tracking your cholesterol.',
            color: 'bg-yellow-500/10',
        };
    } else {
        const lastTestDate = new Date(lastLipidRecord.date);
        const retestYears = (hasMedicalConditions || (age && age > 40)) ? 2 : 4;
        const yearsSinceLastTest = differenceInYears(new Date(), lastTestDate);
        const nextTestDate = addYears(lastTestDate, retestYears);

        if (yearsSinceLastTest >= retestYears) {
            lipidContent = {
                icon: <Flame className="h-5 w-5 text-destructive" />,
                title: 'Lipid Panel Due',
                description: `Last test was ${formatDistanceToNow(lastTestDate)} ago. Retesting is recommended.`,
                color: 'bg-destructive/10',
            };
        } else {
            lipidContent = {
                icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
                title: 'Lipid Panel On Track',
                description: `Next test is around ${format(nextTestDate, 'MMM yyyy')}.`,
                color: 'bg-green-500/10',
            };
        }
    }
     reminders.push(
      <div key="lipid" className="flex items-center gap-4">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${lipidContent.color}`}>
            {lipidContent.icon}
        </div>
        <div>
            <p className="font-semibold">{lipidContent.title}</p>
            <p className="text-sm text-muted-foreground">{lipidContent.description}</p>
        </div>
      </div>
    );
  }
  
  // Thyroid Panel Reminder
  const isThyroidPanelEnabled = Object.values(diseasePanels?.thyroid || {}).some(Boolean);
  if (isThyroidPanelEnabled) {
    const sortedThyroidRecords = [...(thyroidRecords || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastThyroidRecord = sortedThyroidRecords[0];
    let thyroidContent;

    if (!lastThyroidRecord) {
      thyroidContent = {
        icon: <Activity className="h-5 w-5 text-yellow-500" />,
        title: 'Consider a Thyroid Test',
        description: 'Speak to your doctor about whether a TSH test is right for you.',
        color: 'bg-yellow-500/10',
      };
    } else {
      const lastTestDate = new Date(lastThyroidRecord.date);
      const yearsSinceLastTest = differenceInYears(new Date(), lastTestDate);
      // General population screening isn't universally recommended, but every 5 years is a common interval if started.
      const retestYears = 5; 
      const nextTestDate = addYears(lastTestDate, retestYears);
      
      if (yearsSinceLastTest >= retestYears) {
        thyroidContent = {
          icon: <Activity className="h-5 w-5 text-yellow-500" />,
          title: 'Thyroid Check-up Recommended',
          description: `Last test was ${formatDistanceToNow(lastTestDate, { addSuffix: true })}. Consider a follow-up.`,
          color: 'bg-yellow-500/10',
        };
      } else {
        thyroidContent = {
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
          title: 'Thyroid On Track',
          description: `Last test was normal. Next check-up around ${format(nextTestDate, 'MMM yyyy')}.`,
          color: 'bg-green-500/10',
        };
      }
    }
     reminders.push(
      <div key="thyroid" className="flex items-center gap-4">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${thyroidContent.color}`}>
            {thyroidContent.icon}
        </div>
        <div>
            <p className="font-semibold">{thyroidContent.title}</p>
            <p className="text-sm text-muted-foreground">{thyroidContent.description}</p>
        </div>
      </div>
    );
  }

  if (reminders.length === 0) {
    return (
        <UniversalCard
            icon={<Bell className="h-6 w-6 text-primary" />}
            title="Testing Reminders"
            description="Your upcoming health check schedule."
        >
            <div className="text-center text-muted-foreground text-sm py-8">
                <p>No reminders to show right now.</p>
                <p>Enable more biomarker panels to see relevant reminders.</p>
            </div>
        </UniversalCard>
    );
  }


  return (
    <UniversalCard
      icon={<Bell className="h-6 w-6 text-primary" />}
      title="Testing Reminders"
      description="Your upcoming health check schedule."
    >
        <div className="space-y-4">
            {reminders.map((reminder, index) => (
                <React.Fragment key={index}>
                    {reminder}
                    {index < reminders.length - 1 && <Separator />}
                </React.Fragment>
            ))}
        </div>
    </UniversalCard>
  );
}
