

'use client';

import { useApp } from '@/context/app-context';
import { differenceInMonths, formatDistanceToNow, addMonths, format, differenceInYears, addYears, differenceInDays } from 'date-fns';
import { Bell, CheckCircle2, Heart, Sun, Activity, Zap } from 'lucide-react';
import { calculateAge } from '@/lib/utils';
import { Separator } from './ui/separator';
import { UniversalCard } from './universal-card';

export function ReminderCard() {
  const { fastingBloodGlucoseRecords, thyroidRecords, bloodPressureRecords, profile } = useApp();

  if (!profile) return null;

  const hasMedicalConditions = profile.presentMedicalConditions && profile.presentMedicalConditions.length > 0;
  const age = calculateAge(profile.dob);

  // FBG Logic
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
    
    let retestMonths = 36;
    
    if (lastTestValue >= 100 && lastTestValue <= 125) {
      retestMonths = 12; // Yearly for prediabetes
    } else if (lastTestValue > 125) {
      retestMonths = 4; // Every 3-4 months for diabetes
    } else if (hasMedicalConditions || (age && age > 45)) {
      retestMonths = 12; // Yearly
    }

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

  // Thyroid Logic
  const sortedThyroidRecords = [...(thyroidRecords || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const lastThyroidRecord = sortedThyroidRecords[0];
  let thyroidContent;

  if (!lastThyroidRecord) {
      thyroidContent = {
          icon: <Activity className="h-5 w-5 text-yellow-500" />,
          title: 'Time for your first Thyroid Panel!',
          description: 'Add a record to start tracking.',
          color: 'bg-yellow-500/10',
      };
  } else {
      const lastTestDate = new Date(lastThyroidRecord.date);
      // Retesting for thyroid is highly variable, but we'll use a general 1-year reminder.
      const retestYears = 1;
      const yearsSinceLastTest = differenceInYears(new Date(), lastTestDate);
      const nextTestDate = addYears(lastTestDate, retestYears);

      if (yearsSinceLastTest >= retestYears) {
          thyroidContent = {
              icon: <Activity className="h-5 w-5 text-destructive" />,
              title: 'Thyroid Panel Due',
              description: `Last test was ${formatDistanceToNow(lastTestDate)} ago. Retesting is recommended.`,
              color: 'bg-destructive/10',
          };
      } else {
          thyroidContent = {
              icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
              title: 'Thyroid On Track',
              description: `Next test is around ${format(nextTestDate, 'MMM yyyy')}.`,
              color: 'bg-green-500/10',
          };
      }
  }

  // Blood Pressure Logic
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
    const daysSinceLastTest = differenceInDays(new Date(), lastTestDate);

    if (systolic >= 130 || diastolic >= 80) {
      bloodPressureContent = {
        icon: <Zap className="h-5 w-5 text-destructive" />,
        title: 'Follow Up on Blood Pressure',
        description: 'Your last reading was elevated. Please consult your doctor for a management plan.',
        color: 'bg-destructive/10',
      };
    } else if (systolic >= 120) {
      const retestMonths = 3;
      const monthsSinceLastTest = differenceInMonths(new Date(), lastTestDate);
      const nextTestDate = addMonths(lastTestDate, retestMonths);
      if (monthsSinceLastTest >= retestMonths) {
        bloodPressureContent = {
          icon: <Zap className="h-5 w-5 text-yellow-500" />,
          title: 'BP Check Recommended',
          description: `Last check was ${formatDistanceToNow(lastTestDate)} ago. Consider rechecking soon.`,
          color: 'bg-yellow-500/10',
        };
      } else {
        bloodPressureContent = {
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
          title: 'Blood Pressure On Track',
          description: `Last reading was normal. Next check is around ${format(addMonths(lastTestDate, 6), 'MMM yyyy')}.`,
          color: 'bg-green-500/10',
        };
      }
    } else { // Normal BP
      const retestYears = 1;
      const yearsSinceLastTest = differenceInYears(new Date(), lastTestDate);
      const nextTestDate = addYears(lastTestDate, retestYears);
      if (yearsSinceLastTest >= retestYears) {
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
              description: `Your next annual check is around ${format(nextTestDate, 'MMM yyyy')}.`,
              color: 'bg-green-500/10',
          };
      }
    }
  }

  return (
    <UniversalCard
      icon={<Bell className="h-6 w-6 text-primary" />}
      title="Testing Reminders"
      description="Your upcoming health check schedule."
    >
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${fastingBloodGlucoseContent.color}`}>
                    {fastingBloodGlucoseContent.icon}
                </div>
                <div>
                    <p className="font-semibold">{fastingBloodGlucoseContent.title}</p>
                    <p className="text-sm text-muted-foreground">{fastingBloodGlucoseContent.description}</p>
                </div>
            </div>
            <Separator />
            <div className="flex items-center gap-4">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${thyroidContent.color}`}>
                    {thyroidContent.icon}
                </div>
                <div>
                    <p className="font-semibold">{thyroidContent.title}</p>
                    <p className="text-sm text-muted-foreground">{thyroidContent.description}</p>
                </div>
            </div>
            <Separator />
            <div className="flex items-center gap-4">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${bloodPressureContent.color}`}>
                    {bloodPressureContent.icon}
                </div>
                <div>
                    <p className="font-semibold">{bloodPressureContent.title}</p>
                    <p className="text-sm text-muted-foreground">{bloodPressureContent.description}</p>
                </div>
            </div>
        </div>
    </UniversalCard>
  );
}
