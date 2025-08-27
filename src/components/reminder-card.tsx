
'use client';

import { useApp } from '@/context/app-context';
import { differenceInMonths, formatDistanceToNow, addMonths, format, differenceInYears, addYears } from 'date-fns';
import { Bell, CheckCircle2, Heart, Droplet, Sun, Activity, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { calculateAge } from '@/lib/utils';
import { Separator } from './ui/separator';

export function ReminderCard() {
  const { records, lipidRecords, vitaminDRecords, thyroidRecords, bloodPressureRecords, profile } = useApp();

  const hasMedicalConditions = profile.presentMedicalConditions && profile.presentMedicalConditions.length > 0;
  const age = calculateAge(profile.dob);

  // HbA1c Logic
  const sortedHba1cRecords = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const lastHba1cRecord = sortedHba1cRecords[0];
  let hba1cContent;

  if (!lastHba1cRecord) {
    hba1cContent = {
      icon: <Droplet className="h-5 w-5 text-yellow-500" />,
      title: 'Time for your first HbA1c test!',
      description: 'Add a record to start tracking.',
      color: 'bg-yellow-500/10',
    };
  } else {
    const lastTestDate = new Date(lastHba1cRecord.date);
    const lastTestValue = lastHba1cRecord.value;
    
    let status = 'Healthy';
    let retestMonths = 36;
    
    if (lastTestValue >= 5.7 && lastTestValue <= 6.4) {
      status = 'Prediabetes';
      retestMonths = 12; // Yearly
    } else if (lastTestValue >= 6.5) {
      status = 'Diabetes';
      retestMonths = 4; // Every 3-4 months
    } else if (hasMedicalConditions || (age && age > 45)) {
      retestMonths = 12; // Yearly
    }

    const monthsSinceLastTest = differenceInMonths(new Date(), lastTestDate);
    const nextTestDate = addMonths(lastTestDate, retestMonths);
    
    if (monthsSinceLastTest >= retestMonths) {
       hba1cContent = {
        icon: <Droplet className="h-5 w-5 text-destructive" />,
        title: 'HbA1c Test Due',
        description: `Last test was ${formatDistanceToNow(lastTestDate)} ago. Retesting is recommended.`,
        color: 'bg-destructive/10',
      };
    } else {
       hba1cContent = {
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        title: 'HbA1c On Track',
        description: `Next test is around ${format(nextTestDate, 'MMM yyyy')}.`,
        color: 'bg-green-500/10',
      };
    }
  }

  // Lipid Logic
  const sortedLipidRecords = [...lipidRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const lastLipidRecord = sortedLipidRecords[0];
  let lipidContent;

  if (!lastLipidRecord) {
    lipidContent = {
      icon: <Heart className="h-5 w-5 text-yellow-500" />,
      title: 'Time for your first lipid panel!',
      description: 'Add a record to start tracking.',
      color: 'bg-yellow-500/10',
    };
  } else {
    const lastTestDate = new Date(lastLipidRecord.date);
    let retestYears = 5;
    if (hasMedicalConditions) retestYears = 1;
    else if (age && age > 40) retestYears = 2;
    
    const yearsSinceLastTest = differenceInYears(new Date(), lastTestDate);
    const nextTestDate = addYears(lastTestDate, retestYears);

    if (yearsSinceLastTest >= retestYears) {
      lipidContent = {
        icon: <Heart className="h-5 w-5 text-destructive" />,
        title: 'Lipid Panel Due',
        description: `Last test was ${formatDistanceToNow(lastTestDate)} ago. Retesting is recommended.`,
        color: 'bg-destructive/10',
      };
    } else {
      lipidContent = {
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        title: 'Lipids On Track',
        description: `Next test is around ${format(nextTestDate, 'MMM yyyy')}.`,
        color: 'bg-green-500/10',
      };
    }
  }

  // Vitamin D Logic
  const sortedVitaminDRecords = [...(vitaminDRecords || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const lastVitaminDRecord = sortedVitaminDRecords[0];
  let vitaminDContent;

  if (!lastVitaminDRecord) {
    vitaminDContent = {
        icon: <Sun className="h-5 w-5 text-yellow-500" />,
        title: 'Time for your first Vitamin D test!',
        description: 'Add a record to start tracking.',
        color: 'bg-yellow-500/10',
    };
  } else {
      const lastTestDate = new Date(lastVitaminDRecord.date);
      const retestYears = 1; // General recommendation is yearly, can be more frequent if deficient
      const yearsSinceLastTest = differenceInYears(new Date(), lastTestDate);
      const nextTestDate = addYears(lastTestDate, retestYears);

      if (yearsSinceLastTest >= retestYears) {
          vitaminDContent = {
              icon: <Sun className="h-5 w-5 text-destructive" />,
              title: 'Vitamin D Test Due',
              description: `Last test was ${formatDistanceToNow(lastTestDate)} ago. Retesting is recommended.`,
              color: 'bg-destructive/10',
          };
      } else {
          vitaminDContent = {
              icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
              title: 'Vitamin D On Track',
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
      const lastTestDate = new Date(lastBloodPressureRecord.date);
      let retestYears = 1; // General recommendation is yearly, more often if high
      if (lastBloodPressureRecord.systolic > 130 || lastBloodPressureRecord.diastolic > 80) {
        retestYears = 0; // Effectively recommending more frequent checks
      }
      
      const yearsSinceLastTest = differenceInYears(new Date(), lastTestDate);
      const nextTestDate = addYears(lastTestDate, retestYears);

      if (yearsSinceLastTest >= retestYears) {
          bloodPressureContent = {
              icon: <Zap className="h-5 w-5 text-destructive" />,
              title: 'Blood Pressure Check Due',
              description: `Last check was ${formatDistanceToNow(lastTestDate)} ago. Retesting is recommended.`,
              color: 'bg-destructive/10',
          };
      } else {
          bloodPressureContent = {
              icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
              title: 'Blood Pressure On Track',
              description: `Next check is around ${format(nextTestDate, 'MMM yyyy')}.`,
              color: 'bg-green-500/10',
          };
      }
  }


  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>Testing Reminders</CardTitle>
            <CardDescription>Your upcoming health check schedule.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${hba1cContent.color}`}>
            {hba1cContent.icon}
          </div>
          <div>
            <p className="font-semibold">{hba1cContent.title}</p>
            <p className="text-sm text-muted-foreground">{hba1cContent.description}</p>
          </div>
        </div>
        <Separator />
        <div className="flex items-center gap-4">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${lipidContent.color}`}>
            {lipidContent.icon}
          </div>
          <div>
            <p className="font-semibold">{lipidContent.title}</p>
            <p className="text-sm text-muted-foreground">{lipidContent.description}</p>
          </div>
        </div>
        <Separator />
        <div className="flex items-center gap-4">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${vitaminDContent.color}`}>
            {vitaminDContent.icon}
          </div>
          <div>
            <p className="font-semibold">{vitaminDContent.title}</p>
            <p className="text-sm text-muted-foreground">{vitaminDContent.description}</p>
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
      </CardContent>
    </Card>
  );
}
