'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Loader2, X } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { startOfDay, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/context/app-context';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { FormActions } from './form-actions';

interface AddRecordDialogLayoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
  title: string;
  description: string;
  form: UseFormReturn<any>;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  children: React.ReactNode;
  existingRecords?: { date: string | Date }[];
}

export function AddRecordDialogLayout({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  form,
  onSubmit,
  isSubmitting,
  children,
  existingRecords,
}: AddRecordDialogLayoutProps) {
  const { toast } = useToast();
  const { profile } = useApp();
  const isMobile = useIsMobile();

  const handleFormSubmit = (data: any) => {
    if (existingRecords) {
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
        return;
      }
    }
    onSubmit(data);
  };
  
  const handleTriggerClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (profile.medication.length === 0) {
      e.preventDefault();
      toast({
        variant: 'destructive',
        title: 'Medication Required',
        description: 'Please enter your current medication or select "Nil" in your profile before adding a new record.',
      });
      onOpenChange(false);
    } else {
      onOpenChange(true);
    }
  };

  const formContent = (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
          {children}
           <FormActions
              onCancel={() => onOpenChange(false)}
              isSubmitting={isSubmitting}
              submitText="Save Record"
           />
        </form>
    </Form>
  );

  if (isMobile) {
    if (!open) {
      return trigger ? React.cloneElement(trigger as React.ReactElement, {
        onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
          if ((trigger as React.ReactElement).props.onClick) {
            (trigger as React.ReactElement).props.onClick(e);
          }
          handleTriggerClick(e);
        },
      }) : null;
    }
    return (
        <Card className="mt-4 border-primary">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange(false)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {formContent}
            </CardContent>
        </Card>
    );
  }

  const content = (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      {formContent}
    </DialogContent>
  );
  
  if (trigger) {
    const triggerWithClick = React.cloneElement(trigger as React.ReactElement, {
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        if ((trigger as React.ReactElement).props.onClick) {
          (trigger as React.ReactElement).props.onClick(e);
        }
        handleTriggerClick(e);
      },
    });

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>{triggerWithClick}</DialogTrigger>
        {content}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {content}
    </Dialog>
  )
}
