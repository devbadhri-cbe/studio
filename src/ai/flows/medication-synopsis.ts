
'use server';

/**
 * @fileOverview Generates a patient-friendly synopsis for a given medication.
 *
 * - getMedicationSynopsis - A function that returns a synopsis for a medication.
 * - MedicationSynopsisInput - The input type for the getMedicationSynopsis function.
 * - MedicationSynopsisOutput - The return type for the getMedicationSynopsis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MedicationSynopsisInputSchema = z.object({
  medicationName: z.string().describe('The name of the medication to get a synopsis for.'),
});
export type MedicationSynopsisInput = z.infer<typeof MedicationSynopsisInputSchema>;

const MedicationSynopsisOutputSchema = z.object({
  synopsis: z.string().describe('A patient-friendly synopsis of the medication, including its use, common side effects, and important warnings, preceded by a disclaimer.'),
});
export type MedicationSynopsisOutput = z.infer<typeof MedicationSynopsisOutputSchema>;


export async function getMedicationSynopsis(input: MedicationSynopsisInput): Promise<MedicationSynopsisOutput> {
  return medicationSynopsisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'medicationSynopsisPrompt',
  input: {schema: MedicationSynopsisInputSchema},
  output: {schema: MedicationSynopsisOutputSchema},
  prompt: `You are an expert clinical pharmacist providing patient-friendly information. Your task is to generate a concise synopsis for the following medication: {{{medicationName}}}

The synopsis should be easy for a layperson to understand and include:
1.  **What it is:** A brief description of the medication and its primary use.
2.  **Common Side Effects:** A short list of common, non-critical side effects.
3.  **Important Warnings:** A brief mention of critical warnings or when to contact a doctor.

IMPORTANT: Your response MUST begin with the following disclaimer, exactly as written:
"DISCLAIMER: This information is for educational purposes only and is not a substitute for professional medical advice. Always consult your doctor or pharmacist for personalized guidance."

After the disclaimer, provide the synopsis.
`,
});

const medicationSynopsisFlow = ai.defineFlow(
  {
    name: 'medicationSynopsisFlow',
    inputSchema: MedicationSynopsisInputSchema,
    outputSchema: MedicationSynopsisOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
