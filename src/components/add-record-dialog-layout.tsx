'use client';

import * as React from 'react';
import { Form } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { startOfDay, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { FormActions } from './form-actions';

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
      <Card className="mt-2 bg-background/80 backdrop-blur-sm">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)}>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {children}
                    </div>
                </CardContent>
                <CardFooter className="justify-center">
                    <FormActions
                        onCancel={onCancel}
                        isSubmitting={isSubmitting}
                        submitText="Save Record"
                    />
                </CardFooter>
            </form>
        </Form>
      </Card>
  );
}
