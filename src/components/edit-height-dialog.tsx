
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
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { cmToFtIn, ftInToCm } from '@/lib/utils';

const FormSchema = z.object({
  height_cm: z.coerce.number().optional(),
  height_ft: z.coerce.number().optional(),
  height_in: z.coerce.number().optional(),
});

export interface EditHeightDialogHandles {
    open: () => void;
}

export const EditHeightDialog = React.forwardRef<EditHeightDialogHandles>((props, ref) => {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { profile, setProfile } = useApp();
  const { toast } = useToast();
  const isImperial = profile.unitSystem === 'imperial';

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      height_cm: undefined,
      height_ft: undefined,
      height_in: undefined,
    },
  });

  React.useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
  }));
  
  React.useEffect(() => {
    if (open) {
      if (profile.height) {
        if (isImperial) {
          const { feet, inches } = cmToFtIn(profile.height);
          form.reset({ height_ft: feet, height_in: inches });
        } else {
          form.reset({ height_cm: profile.height });
        }
      } else {
        form.reset({ height_cm: undefined, height_ft: undefined, height_in: undefined });
      }
    }
  }, [open, profile.height, isImperial, form]);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true);
    try {
        let heightInCm: number | undefined;
        if (isImperial) {
            const ft = data.height_ft ? Number(data.height_ft) : 0;
            const inches = data.height_in ? Number(data.height_in) : 0;
            heightInCm = ft > 0 || inches > 0 ? ftInToCm(ft, inches) : undefined;
        } else {
            heightInCm = data.height_cm ? Number(data.height_cm) : undefined;
        }

        setProfile({ ...profile, height: heightInCm });
        
        toast({
            title: 'Success!',
            description: 'Your height has been updated.',
        });
        setOpen(false);
    } catch (error) {
        console.error("Failed to update height", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not save your height."
        });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Height</DialogTitle>
            <DialogDescription>Update your height below. This will recalculate your BMI.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
               {isImperial ? (
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                        control={form.control}
                        name="height_ft"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Height (ft)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g., 5" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="height_in"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Height (in)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g., 9" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                ) : (
                    <FormField
                    control={form.control}
                    name="height_cm"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Height (cm)</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.1" placeholder="e.g., 175.5" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                )}
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Height
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
  );
});

EditHeightDialog.displayName = 'EditHeightDialog';
