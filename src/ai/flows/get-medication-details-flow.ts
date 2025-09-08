
'use server';
/**
 * @fileOverview An AI flow to get the chemical and brand name for a medication.
 *
 * - getMedicationDetails - A function that returns the chemical and brand name for a medication.
 * - GetMedicationDetailsInput - The input type for the function.
 * - GetMedicationDetailsOutput - The return type for the function.
 */

import {ai, googleAI} from '@/ai/genkit';
import {z} from 'genkit';

const GetMedicationDetailsInputSchema = z.object({
  medicationName: z.string().describe('The name of the medication provided by the user. This could be a brand name or a chemical name.'),
});
export type GetMedicationDetailsInput = z.infer<typeof GetMedicationDetailsInputSchema>;

const GetMedicationDetailsOutputSchema = z.object({
  chemicalName: z.string().describe('The standardized chemical (generic) name of the medication.'),
  brandName: z.string().describe('The most common brand name for the medication.'),
});
export type GetMedicationDetailsOutput = z.infer<typeof GetMedicationDetailsOutputSchema>;


export async function getMedicationDetails(input: GetMedicationDetailsInput): Promise<GetMedicationDetailsOutput> {
    return getMedicationDetailsFlow(input);
}

const prompt = ai.definePrompt({
    name: 'getMedicationDetailsPrompt',
    input: {schema: GetMedicationDetailsInputSchema},
    output: {schema: GetMedicationDetailsOutputSchema},
    model: googleAI.model('gemini-1.5-flash-latest'),
    prompt: `You are a pharmaceutical expert. The user will provide a medication name. Your task is to identify if it's a brand name or a chemical (generic) name.
    
Based on the input, you must return both the standardized chemical name and the most common brand name.

For example:
- If the input is "Lipitor", you should return chemicalName: "Atorvastatin" and brandName: "Lipitor".
- If the input is "Metformin", you should return chemicalName: "Metformin" and brandName: "Glucophage".
- If the input is "Rosuvas 10", you should return chemicalName: "Rosuvas" and brandName: "Rosuvas".

Medication Name: {{{medicationName}}}

Return the correct chemical and brand names.`,
});

const getMedicationDetailsFlow = ai.defineFlow(
    {
        name: 'getMedicationDetailsFlow',
        inputSchema: GetMedicationDetailsInputSchema,
        outputSchema: GetMedicationDetailsOutputSchema,
    },
    async (input) => {
        const {output} = await prompt(input);
        return output!;
    }
);
