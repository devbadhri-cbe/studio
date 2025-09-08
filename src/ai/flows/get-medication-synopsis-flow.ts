
'use server';
/**
 * @fileOverview An AI flow to generate a synopsis for a medication, tailored for a patient audience.
 *
 * - getMedicationSynopsis - A function that returns a synopsis for a given medication.
 * - GetMedicationSynopsisInput - The input type for the getMedicationSynopsis function.
 * - GetMedicationSynopsisOutput - The return type for the getMedicationSynopsis function.
 */

import {ai, googleAI} from '@/ai/genkit';
import {z} from 'genkit';

const GetMedicationSynopsisInputSchema = z.object({
  medicationName: z.string().describe('The name of the medication.'),
});
export type GetMedicationSynopsisInput = z.infer<typeof GetMedicationSynopsisInputSchema>;

const GetMedicationSynopsisOutputSchema = z.object({
  synopsis: z.string().describe('The generated synopsis for the medication.'),
});
export type GetMedicationSynopsisOutput = z.infer<typeof GetMedicationSynopsisOutputSchema>;


export async function getMedicationSynopsis(input: GetMedicationSynopsisInput): Promise<GetMedicationSynopsisOutput> {
    return getMedicationSynopsisFlow(input);
}

const prompt = ai.definePrompt({
    name: 'getMedicationSynopsisPrompt',
    input: {schema: GetMedicationSynopsisInputSchema},
    output: {schema: GetMedicationSynopsisOutputSchema},
    model: googleAI.model('gemini-1.5-flash-latest'),
    prompt: `
      You are a compassionate health educator. Your task is to explain a medication to a patient in simple, clear, and reassuring language. 
      Focus on what the medication is for, how it works in general terms, and common side effects or important considerations. 
      Do not provide medical advice or suggest specific dosages. Emphasize that the patient should follow their doctor's instructions.

      Medication: {{{medicationName}}}

      Generate a brief, easy-to-understand synopsis for the patient.
    `,
});

const getMedicationSynopsisFlow = ai.defineFlow(
    {
        name: 'getMedicationSynopsisFlow',
        inputSchema: GetMedicationSynopsisInputSchema,
        outputSchema: GetMedicationSynopsisOutputSchema,
    },
    async (input) => {
        const {output} = await prompt(input);
        return output!;
    }
);
