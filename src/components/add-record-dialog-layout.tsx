'use client';

import * as React from 'react';
import { Form } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { startOfDay, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { FormActions } from './form-actions';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

interface AddRecordDialogLayoutProps {
  onCancel: () => void;
  title: string;
  description: string;
  form: UseFormReturn<any>;
  onSubmit: (data: any) => void;
  children: React.ReactNode;
  existingRecords?: { date: string | Date }[];
}

export function AddRecordDialogLayout({
  onCancel,
  title,
  description,
  form,
  onSubmit,
  children,
  existingRecords,
}: AddRecordDialogLayoutProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    if (existingRecords && data.date) {
      const newDate = startOfDay(data.date);
      const dateExists = existingRecords.some((record) => {
          const storedDate = startOfDay(parseISO(record.date as string));
          return storedDate.getTime() === newDate.getTime();
      });

      if (dateExists) {
        toast({
          variant: 'destructive',
          title: 'Duplicate Entry',
          description: 'A record for this date already exists. Please choose a different date.',
        });
        setIsSubmitting(false);
        return;
      }
    }
    await onSubmit(data);
    setIsSubmitting(false);
  };
  
  return (
      <Card className="mt-2 border-primary border-2">
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                {children}
                 <FormActions
                    onCancel={onCancel}
                    isSubmitting={isSubmitting}
                    submitText="Save Record"
                 />
                </form>
            </Form>
        </CardContent>
      </Card>
  );
}
