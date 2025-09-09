
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
import { Loader2 } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { startOfDay, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/context/app-context';

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
    if (!profile.medication || profile.medication.length === 0) {
      e.preventDefault();
      toast({
        variant: 'destructive',
        title: 'Medication Required',
        description: 'Please enter your current medication or select "Nil" in your profile before adding a new record.',
      });
      onOpenChange(false); // Close the dialog if it was about to open
    } else {
      onOpenChange(true);
    }
  };

  const content = (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
          {children}
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Record
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
  
  if (trigger) {
    // Clone the trigger to attach the onClick event
    const triggerWithClick = React.cloneElement(trigger as React.ReactElement, {
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        // Allow original onClick from button to fire if it exists
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
