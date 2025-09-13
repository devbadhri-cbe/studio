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
      <Card className="mt-2 border-destructive border-4 flex flex-col">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex flex-col flex-1">
                <CardHeader className="border-blue-500 border-2">
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="border-green-500 border-2 flex-1">
                    <div className="flex flex-col justify-center space-y-4">
                        {children}
                    </div>
                </CardContent>
                <CardFooter>
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
