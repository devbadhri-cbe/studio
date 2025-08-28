'use server';

/**
 * @fileOverview Checks the spelling of a medication name and suggests a correction if needed.
 *
 * - spellCheckMedication - A function that performs the spell check.
 * - SpellCheckMedicationInput - The input type for the spellCheckMedication function.
 * - SpellCheckMedicationOutput - The return type for the spellCheckMedication function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SpellCheckMedicationInputSchema = z.object({
  medicationName: z.string().describe('The name of the medication to spell check.'),
});
export type SpellCheckMedicationInput = z.infer<typeof SpellCheckMedicationInputSchema>;

const SpellCheckMedicationOutputSchema = z.object({
  correctedName: z.string().describe('The corrected spelling of the medication name, or the original name if it was correct.'),
  wasCorrected: z.boolean().describe('Whether a correction was made.'),
});
export type SpellCheckMedicationOutput = z.infer<typeof SpellCheckMedicationOutputSchema>;

export async function spellCheckMedication(input: SpellCheckMedicationInput): Promise<SpellCheckMedicationOutput> {
  return spellCheckMedicationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'spellCheckMedicationPrompt',
  input: {schema: SpellCheckMedicationInputSchema},
  output: {schema: SpellCheckMedicationOutputSchema},
  prompt: `You are a world-class pharmacologist. A user has entered a medication name, and your task is to validate and correct its spelling.

Medication Entered: {{{medicationName}}}

1.  Analyze the entered name.
2.  If it is misspelled, provide the correctly spelled, standard chemical or brand name. Set 'wasCorrected' to true.
3.  If the spelling is already correct, return the original name and set 'wasCorrected' to false.
4.  Do not add any commentary or explanation. Only return the corrected name and the boolean value.
`,
});

const spellCheckMedicationFlow = ai.defineFlow(
  {
    name: 'spellCheckMedicationFlow',
    inputSchema: SpellCheckMedicationInputSchema,
    outputSchema: SpellCheckMedicationOutputSchema,
  },
  async (input) => {
    if (!input.medicationName) {
      return { correctedName: '', wasCorrected: false };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
