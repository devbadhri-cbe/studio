
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/context/app-context';
import { Loader2 } from 'lucide-react';
import { getDashboardRecommendations } from '@/ai/flows/get-dashboard-recommendations';

const FormSchema = z.object({
  name: z.string().min(2, { message: 'Biomarker or condition name is required.' }),
});

interface CreateBiomarkerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateBiomarkerDialog({ open, onOpenChange }: CreateBiomarkerDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { addCustomBiomarker, customBiomarkers, enableDashboard } = useApp();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { name: '' },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({ name: '' });
    }
  }, [open, form]);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true);
    try {
      const { recommendedDashboard } = await getDashboardRecommendations({ conditionName: data.name });

      if (recommendedDashboard !== 'none') {
        const result = enableDashboard(recommendedDashboard);
        if (result.alreadyExists) {
            toast({
                variant: 'default',
                title: 'Dashboard Already Enabled',
                description: `The ${result.name} dashboard is already on your patient view.`,
            });
        } else {
             toast({
                title: 'Dashboard Enabled',
                description: `The ${result.name} dashboard has been added to your view.`,
            });
        }
      } else {
        const existingBiomarker = customBiomarkers.find(
          (b) => b.name.toLowerCase() === data.name.toLowerCase()
        );

        if (existingBiomarker) {
          toast({
            variant: 'destructive',
            title: 'Duplicate Biomarker',
            description: `A custom biomarker named "${data.name}" already exists.`,
          });
        } else {
           await addCustomBiomarker(data.name);
            toast({
                title: 'Biomarker Created',
                description: `The "${data.name}" card has been added to your dashboard.`,
            });
        }
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create biomarker or enable dashboard', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not perform the requested action.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Dashboard or Biomarker</DialogTitle>
          <DialogDescription>
            Enter a condition (e.g., "Diabetes") to add a relevant dashboard, or a biomarker name to create a custom card.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition or Biomarker Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., HbA1c, Diabetes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add to Dashboard
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
