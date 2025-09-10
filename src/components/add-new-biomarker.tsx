

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form';
import { toast } from '@/hooks/use-toast';
import { createBiomarkerFiles } from '@/ai/flows/create-biomarker-flow';
import { useApp } from '@/context/app-context';

interface AddNewBiomarkerProps {
    onCancel: () => void;
}

const toCamelCase = (str: string) => {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
};

export function AddNewBiomarker({ onCancel }: AddNewBiomarkerProps) {
    const [isCreating, setIsCreating] = React.useState(false);
    const { profile } = useApp();

    const form = useForm({
        defaultValues: {
            name: '',
            unit: '',
        }
    });

    const handleCreate = async (data: { name: string, unit: string }) => {
        setIsCreating(true);
        try {
            if (!profile.id) {
                throw new Error('Patient ID is not available.');
            }
            const result = await createBiomarkerFiles({
                name: data.name,
                unit: data.unit,
                key: toCamelCase(data.name),
                patientId: profile.id,
            });

            if (result.success) {
                toast({
                    title: 'Biomarker Files Created!',
                    description: `The basic files for ${data.name} have been generated. Further integration is required.`,
                });
                onCancel();
            } else {
                throw new Error('Failed to create biomarker files.');
            }
        } catch (error) {
            console.error("Failed to create biomarker:", error);
            toast({
                variant: 'destructive',
                title: 'Creation Failed',
                description: 'Could not generate the biomarker files. Please try again.',
            });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Card className="border-primary border-2 mb-4">
            <CardHeader>
                <CardTitle>Create New Biomarker</CardTitle>
                <CardDescription>
                    Define a new biomarker. The AI will generate the necessary card, chart, and dialog components.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            rules={{ required: "Biomarker name is required." }}
                            render={({ field }) => (
                                <FormItem>
                                    <Label htmlFor="biomarkerName">Biomarker Name</Label>
                                    <FormControl>
                                        <Input
                                            id="biomarkerName"
                                            placeholder="e.g., Uric Acid"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="unit"
                            rules={{ required: "Unit is required." }}
                            render={({ field }) => (
                                <FormItem>
                                    <Label htmlFor="biomarkerUnit">Unit of Measurement</Label>
                                    <FormControl>
                                        <Input
                                            id="biomarkerUnit"
                                            placeholder="e.g., mg/dL"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                            <Button type="submit" disabled={isCreating}>
                                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
