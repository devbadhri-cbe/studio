
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
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const FormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long.'),
  description: z.string().optional(),
});

interface CreateCustomBiomarkerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateCustomBiomarkerDialog({ open, onOpenChange }: CreateCustomBiomarkerDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { addCustomBiomarker } = useApp();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { name: '', description: '' },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({ name: '', description: '' });
    }
  }, [open, form]);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true);
    try {
        addCustomBiomarker(data.name, data.description);
        toast({
            title: 'Biomarker Created',
            description: `The "${data.name}" biomarker card has been added.`,
        });
        onOpenChange(false);
    } catch (error) {
        console.error("Failed to create biomarker", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not create the biomarker."
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Custom Biomarker</DialogTitle>
            <DialogDescription>Define a new biomarker to track for this patient.</DialogDescription>
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
                      <Input placeholder="e.g., Cortisol, Iron Levels" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe what this biomarker measures." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                 <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Biomarker
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
  );
}
