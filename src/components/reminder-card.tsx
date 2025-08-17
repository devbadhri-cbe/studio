'use client';

import { useApp } from '@/context/app-context';
import { differenceInMonths, formatDistanceToNow, addMonths, format } from 'date-fns';
import { Bell, CheckCircle2 } from 'lucide-react';
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
      description: 'Add your first HbA1c record to start tracking.',
      color: 'bg-yellow-500/10',
    };
  } else {
    const lastTestDate = new Date(lastRecord.date);
    const monthsSinceLastTest = differenceInMonths(new Date(), lastTestDate);
    const nextTestDate = addMonths(lastTestDate, 4);

    if (monthsSinceLastTest >= 4) {
      content = {
        icon: <Bell className="h-6 w-6 text-destructive" />,
        title: 'Reminder: Time for your test!',
        description: `Your last test was ${formatDistanceToNow(lastTestDate)} ago. Please schedule your next one.`,
        color: 'bg-destructive/10',
      };
    } else {
      content = {
        icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
        title: 'You are on track!',
        description: `Your next test is due around ${format(nextTestDate, 'MMMM yyyy')}.`,
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
