'use client';

import { useApp } from '@/context/app-context';
import { differenceInMonths, formatDistanceToNow, addMonths, format, differenceInYears } from 'date-fns';
import { Bell, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function ReminderCard() {
  const { records } = useApp();

  const sortedRecords = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const lastRecord = sortedRecords[0];

  let content;

  if (!lastRecord) {
    content = {
      icon: <Bell className="h-6 w-6 text-yellow-500" />,
      title: 'Time for your first test!',
      description: 'Add your first HbA1c record to start tracking your health.',
      color: 'bg-yellow-500/10',
    };
  } else {
    const lastTestDate = new Date(lastRecord.date);
    const lastTestValue = lastRecord.value;
    
    let status = 'Healthy';
    let retestMonths = 36; // 3 years for healthy
    
    if (lastTestValue >= 5.7 && lastTestValue <= 6.4) {
      status = 'Prediabetes';
      retestMonths = 12; // 1 year for prediabetes
    } else if (lastTestValue >= 6.5) {
      status = 'Diabetes';
      retestMonths = 4; // 4 months for diabetes
    }

    const monthsSinceLastTest = differenceInMonths(new Date(), lastTestDate);
    const nextTestDate = addMonths(lastTestDate, retestMonths);

    if (monthsSinceLastTest >= retestMonths) {
       content = {
        icon: <Bell className="h-6 w-6 text-destructive" />,
        title: 'Reminder: Time for your test!',
        description: `Based on your last result (${status}), it's recommended to test every ${retestMonths} months. Your last test was ${formatDistanceToNow(lastTestDate)} ago.`,
        color: 'bg-destructive/10',
      };
    } else {
       content = {
        icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
        title: 'You are on track!',
        description: `With a status of "${status}", your next recommended test is around ${format(nextTestDate, 'MMMM yyyy')}.`,
        color: 'bg-green-500/10',
      };
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
