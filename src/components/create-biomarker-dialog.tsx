
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

const FormSchema = z.object({
  name: z.string().min(2, { message: 'Biomarker name is required.' }),
});

interface CreateBiomarkerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateBiomarkerDialog({ open, onOpenChange }: CreateBiomarkerDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { addCustomBiomarker, customBiomarkers } = useApp();
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
    const existingBiomarker = customBiomarkers.find(
      (b) => b.name.toLowerCase() === data.name.toLowerCase()
    );

    if (existingBiomarker) {
      toast({
        variant: 'destructive',
        title: 'Duplicate Biomarker',
        description: `A biomarker named "${data.name}" already exists.`,
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await addCustomBiomarker(data.name);
      toast({
        title: 'Biomarker Created',
        description: `The "${data.name}" card has been added to your dashboard.`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create biomarker', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not create the new biomarker.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Biomarker</DialogTitle>
          <DialogDescription>
            Enter a name for the new biomarker card you want to add to your dashboard.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biomarker Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Uric Acid" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Card
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
