
'use client';

import { Stethoscope, PlusCircle, Loader2 } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '@/context/app-context';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { DatePicker } from './ui/date-picker';
import { DiseaseCard } from './disease-card';


const ConditionSchema = z.object({
  condition: z.string().min(2, 'Condition name is required.'),
  date: z.date({ required_error: 'A valid date is required.' }),
});

function MedicalConditionForm({ onSave, onCancel }: { onSave: (data: {condition: string, date: string}) => void, onCancel: () => void }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  React.useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const form = useForm<z.infer<typeof ConditionSchema>>({
    resolver: zodResolver(ConditionSchema),
    defaultValues: { condition: '', date: new Date() },
  });
  
  const handleSubmit = async (data: z.infer<typeof ConditionSchema>) => {
    setIsSubmitting(true);
    await onSave({
        ...data,
        date: data.date.toISOString(),
    });
    setIsSubmitting(false);
    onCancel();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="mt-2 space-y-4 rounded-lg border bg-muted/50 p-2">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormControl>
                <DatePicker
                  placeholder="Date of Diagnosis"
                  value={field.value}
                  onChange={field.onChange}
                  fromYear={new Date().getFullYear() - 50}
                  toYear={new Date().getFullYear()}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField control={form.control} name="condition" render={({ field }) => ( <FormItem><FormControl><Input ref={inputRef} placeholder="Condition Name" {...field} /></FormControl><FormMessage /></FormItem> )}/>
        <div className="flex justify-end gap-2">
          <Button type="button" size="sm" variant="ghost" className="flex-1" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" size="sm" className="flex-1" disabled={isSubmitting}>
             {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export function MedicalConditionsCard() {
  const { profile, addMedicalCondition, removeMedicalCondition, isDoctorLoggedIn } = useApp();
  const [isAddingCondition, setIsAddingCondition] = React.useState(false);
  
  const handleSaveCondition = async (data: { condition: string, date: string}) => {
    addMedicalCondition(data, !isDoctorLoggedIn);
    setIsAddingCondition(false);
  };
  
  const handleReviseCondition = (id: string) => {
      removeMedicalCondition(id);
      setIsAddingCondition(true);
  }

  return (
    <Card className="shadow-xl">
        <CardContent className="space-y-4 text-sm p-4">
            <div>
                <div className="flex items-center justify-between mb-2">
                    <div className='flex items-center gap-3 flex-1'>
                        <Stethoscope className="h-5 w-5 shrink-0 text-muted-foreground" />
                        <h3 className="font-medium">Present Medical Conditions</h3>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        {!isAddingCondition && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setIsAddingCondition(true)}>
                                        <PlusCircle className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Add Condition</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                </div>
                {isAddingCondition && <MedicalConditionForm onSave={handleSaveCondition} onCancel={() => setIsAddingCondition(false)} />}
                {profile.presentMedicalConditions.length > 0 ? (
                    <ul className="space-y-1 mt-2">
                        {profile.presentMedicalConditions.map((condition) => {
                            if (!condition || !condition.id) return null;
                            return (
                                <DiseaseCard 
                                    key={condition.id}
                                    condition={condition}
                                    onRevise={handleReviseCondition}
                                />
                            )
                        })}
                    </ul>
                ) : (
                    !isAddingCondition && <p className="text-xs text-muted-foreground pl-8">No conditions recorded.</p>
                )}
            </div>
        </CardContent>
    </Card>
  );
}
