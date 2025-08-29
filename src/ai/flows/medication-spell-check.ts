
'use server';

/**
 * @fileOverview Checks the spelling of a medication name and suggests a correction using the NIH RxNorm API.
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

const medicationSpellCheckFlow = ai.defineFlow(
  {
    name: 'medicationSpellCheckFlow',
    inputSchema: MedicationSpellingInputSchema,
    outputSchema: MedicationSpellingOutputSchema,
  },
  async (input) => {
    try {
      const response = await fetch(`https://rxnav.nlm.nih.gov/REST/spellingsuggestions.json?name=${encodeURIComponent(input.medicationName)}`);
      
      if (!response.ok) {
        console.error('RxNorm API request failed:', response.statusText);
        return { correctedName: '' };
      }
      
      const data = await response.json();
      
      const suggestions = data.suggestionGroup?.suggestionList?.suggestion;

      if (suggestions && suggestions.length > 0) {
        const bestSuggestion = suggestions[0];
        // Only return a suggestion if it's different from what the user typed (case-insensitive).
        if (bestSuggestion.toLowerCase() !== input.medicationName.toLowerCase()) {
            return { correctedName: bestSuggestion };
        }
      }

      // If no suggestions or the best suggestion is the same as the input, return no correction.
      return { correctedName: '' };

    } catch (error) {
      console.error('Error calling RxNorm API:', error);
      return { correctedName: '' };
    }
  }
);
