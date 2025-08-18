'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Button } from './ui/button';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { format } from 'date-fns';
import { suggestIcdCode } from '@/ai/flows/suggest-icd-code';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';

const FormSchema = z.object({
  condition: z.string().min(2, 'Condition name is required.'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'A valid date is required.' }),
});

export function MedicalConditionsList() {
  const { profile, addMedicalCondition, removeMedicalCondition } = useApp();
  const [isAdding, setIsAdding] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      condition: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true);
    try {
      const { icdCode, description } = await suggestIcdCode({ condition: data.condition });
      addMedicalCondition({
        ...data,
        date: new Date(data.date).toISOString(),
        icdCode: `${icdCode}: ${description}`,
      });
      toast({
        title: 'Condition Added',
        description: `Suggested ICD-10 code: ${icdCode}`,
      });
      form.reset({
        condition: '',
        date: format(new Date(), 'yyyy-MM-dd'),
      });
      setIsAdding(false);
    } catch (error) {
      console.error('Failed to get ICD code suggestion', error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Could not get ICD code suggestion. The condition was added without it.',
      });
       addMedicalCondition({
        ...data,
        date: new Date(data.date).toISOString(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Separator />
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Present Medical Conditions</h3>
          <p className="text-sm text-muted-foreground">Manage diagnosed conditions.</p>
        </div>
        {!isAdding && (
          <Button size="sm" variant="outline" onClick={() => setIsAdding(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Type 2 Diabetes" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Diagnosis</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {profile.presentMedicalConditions.length > 0 ? (
          profile.presentMedicalConditions.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="font-medium">{item.condition}</p>
                <p className="text-sm text-muted-foreground">
                  Diagnosed: {format(new Date(item.date), 'MMMM d, yyyy')}
                </p>
                {item.icdCode && (
                  <p className="text-xs text-muted-foreground">ICD-10: {item.icdCode}</p>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeMedicalCondition(item.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))
        ) : (
          !isAdding && (
            <p className="text-center text-sm text-muted-foreground py-4">No conditions added yet.</p>
          )
        )}
      </div>
    </div>
  );
}
