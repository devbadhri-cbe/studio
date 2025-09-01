

'use client';

import { Stethoscope, PlusCircle, Trash2, Loader2, Info, CheckCircle, AlertTriangle, Edit } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { suggestIcdCode } from '@/ai/flows/suggest-icd-code';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '@/context/app-context';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { DatePicker } from './ui/date-picker';
import { ConditionSynopsisDialog } from './condition-synopsis-dialog';
import type { MedicalCondition } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from './ui/alert';
import { isValid, parseISO } from 'date-fns';

const ConditionSchema = z.object({
  condition: z.string().min(2, 'Condition name is required.'),
  date: z.date({ required_error: 'A valid date is required.' }),
});

type ActiveSynopsis = {
    type: 'condition';
    id: string;
} | null;

function MedicalConditionForm({ onSave, onCancel, existingConditions }: { onSave: (data: {condition: string, date: string}, icdCode?: string) => Promise<void>, onCancel: () => void, existingConditions: MedicalCondition[] }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
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
    try {
      const dateString = data.date.toISOString();
      const { icdCode, description } = await suggestIcdCode({ condition: data.condition });
      const fullIcdCode = `${icdCode}: ${description}`;

      const isDuplicate = existingConditions.some(c => c.icdCode?.startsWith(icdCode));

      if (isDuplicate) {
        toast({
            variant: 'destructive',
            title: 'Duplicate Condition',
            description: `This condition (or a similar one with ICD-11 code ${icdCode}) already exists.`,
        });
      } else {
         await onSave({ ...data, date: dateString }, fullIcdCode);
         toast({
          title: 'Condition Added',
          description: `This will be sent to your doctor for review. Suggested ICD-11 code: ${icdCode}`,
        });
      }
    } catch (error) {
       console.error('Failed to get ICD code suggestion', error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Could not get ICD code suggestion. The condition will be added without it.',
      });
      await onSave({ ...data, date: data.date.toISOString() });
    } finally {
      setIsSubmitting(false);
      onCancel();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="mt-2 space-y-4 rounded-lg border bg-muted/50 p-2">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <DatePicker
                  placeholder='Date of Diagnosis'
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

const statusConfig = {
  verified: { icon: CheckCircle, text: "Verified by doctor", color: "text-green-500" },
  pending_review: { icon: Info, text: "Pending doctor review", color: "text-yellow-500" },
  needs_revision: { icon: AlertTriangle, text: "Doctor requested revision", color: "text-destructive" },
};


export function MedicalConditionsCard() {
  const { profile, addMedicalCondition, removeMedicalCondition, isDoctorLoggedIn } = useApp();
  const [isAddingCondition, setIsAddingCondition] = React.useState(false);
  const [activeSynopsis, setActiveSynopsis] = React.useState<ActiveSynopsis>(null);

  const formatDate = useDateFormatter();
  
  const handleSaveCondition = async (data: { condition: string, date: string }, icdCode?: string) => {
    addMedicalCondition({ ...data, icdCode }, !isDoctorLoggedIn);
    setIsAddingCondition(false);
  };
  
  const handleRemoveCondition = (id: string) => {
      removeMedicalCondition(id);
      if (activeSynopsis?.type === 'condition' && activeSynopsis.id === id) {
          setActiveSynopsis(null);
      }
  }

  const handleReviseCondition = (id: string) => {
      handleRemoveCondition(id);
      setIsAddingCondition(true);
  }
  
  const handleSynopsisToggle = (type: 'condition', id: string) => {
    if (activeSynopsis?.id === id) {
      setActiveSynopsis(null);
    } else {
      setActiveSynopsis({ type, id });
    }
  };

  return (
    <Card>
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
                {isAddingCondition && <MedicalConditionForm onSave={handleSaveCondition} onCancel={() => setIsAddingCondition(false)} existingConditions={profile.presentMedicalConditions} />}
                {profile.presentMedicalConditions.length > 0 ? (
                    <ul className="space-y-1 mt-2">
                        {profile.presentMedicalConditions.map((condition) => {
                            if (!condition || !condition.id) return null; // Safeguard against invalid condition objects
                            const statusInfo = statusConfig[condition.status] || statusConfig.pending_review;
                            const Icon = statusInfo.icon;
                            return (
                                <React.Fragment key={condition.id}>
                                    <li className="group flex items-start gap-2 text-xs text-muted-foreground border-l-2 border-primary pl-3 pr-2 py-1 hover:bg-muted/50 rounded-r-md">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-foreground">{condition.condition}</p>
                                            <Tooltip>
                                                <TooltipTrigger><Icon className={cn("h-3.5 w-3.5", statusInfo.color)} /></TooltipTrigger>
                                                <TooltipContent>{statusInfo.text}</TooltipContent>
                                            </Tooltip>
                                        </div>
                                        {condition.icdCode && <p className='text-xs text-muted-foreground'>ICD-11: {condition.icdCode}</p>}
                                        <p className="text-xs text-muted-foreground">Diagnosed: {formatDate(condition.date)}</p>
                                    </div>
                                        <div className="flex items-center shrink-0">
                                            {isDoctorLoggedIn && (
                                                <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); handleRemoveCondition(condition.id); }}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            )}
                                            <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100" onClick={() => handleSynopsisToggle('condition', condition.id)}>
                                                <Info className="h-4 w-4 text-blue-500" />
                                            </Button>
                                        </div>
                                    </li>
                                     {condition.status === 'needs_revision' && !isDoctorLoggedIn && (
                                        <li className="pl-3 pb-2">
                                            <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 text-destructive text-xs p-2">
                                                <AlertTriangle className="h-4 w-4 !text-destructive" />
                                                <AlertDescription>
                                                    Your doctor has requested a revision. Please update the condition name.
                                                    <Button size="xs" className="ml-2" onClick={() => handleReviseCondition(condition.id)}>
                                                         <Edit className="mr-1 h-3 w-3" />
                                                         Revise & Resubmit
                                                    </Button>
                                                </AlertDescription>
                                            </Alert>
                                        </li>
                                    )}
                                    {activeSynopsis?.type === 'condition' && activeSynopsis.id === condition.id && (
                                        <li className="pl-5 pb-2">
                                            <ConditionSynopsisDialog
                                                conditionName={condition.condition}
                                                onClose={() => setActiveSynopsis(null)}
                                            />
                                        </li>
                                    )}
                                </React.Fragment>
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
