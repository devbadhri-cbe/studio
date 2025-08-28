'use server';

/**
 * @fileOverview Checks the spelling of a medication name and suggests a correction.
 *
 * - checkMedicationSpelling - A function that suggests a correction for a medication name.
 * - MedicationSpellingInput - The input type for the checkMedicationSpelling function.
 * - MedicationSpellingOutput - The return type for the checkMedicationSpelling function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MedicationSpellingInputSchema = z.object({
  medicationName: z.string().describe('The name of the medication to spell-check.'),
});
export type MedicationSpellingInput = z.infer<typeof MedicationSpellingInputSchema>;

const MedicationSpellingOutputSchema = z.object({
  correctedName: z.string().describe('The corrected spelling of the medication name, or an empty string if no correction is found.'),
});
export type MedicationSpellingOutput = z.infer<typeof MedicationSpellingOutputSchema>;


export async function checkMedicationSpelling(input: MedicationSpellingInput): Promise<MedicationSpellingOutput> {
  return medicationSpellCheckFlow(input);
}

const prompt = ai.definePrompt({
  name: 'medicationSpellCheckPrompt',
  input: {schema: MedicationSpellingInputSchema},
  output: {schema: MedicationSpellingOutputSchema},
  prompt: `You are a highly accurate medical spell-checker. Your task is to correct the spelling of a given medication name.

Medication Name: "{{{medicationName}}}"

Based on the provided medication name, return the correctly spelled, standard drug name. If the name is already spelled correctly, return the original name. Only provide the corrected name.
`,
});

const medicationSpellCheckFlow = ai.defineFlow(
  {
    name: 'medicationSpellCheckFlow',
    inputSchema: MedicationSpellingInputSchema,
    outputSchema: MedicationSpellingOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
