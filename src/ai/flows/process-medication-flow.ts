
'use server';
/**
 * @fileOverview An AI flow to identify the active ingredient of a medication.
 *
 * - getMedicationInfo - Analyzes a medication name to find its active ingredient.
 */

import { ai } from '@/ai/genkit';
import { MedicationInfoInputSchema, MedicationInfoOutputSchema, type MedicationInfoInput, type MedicationInfoOutput } from '@/lib/ai-types';
import { gemini15Flash } from '@genkit-ai/googleai';

export async function getMedicationInfo(input: MedicationInfoInput): Promise<MedicationInfoOutput> {
  return processMedicationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'processMedicationPrompt',
  input: { schema: MedicationInfoInputSchema },
  output: { schema: MedicationInfoOutputSchema },
  model: gemini15Flash,
  prompt: `You are a pharmaceutical information expert. Your task is to identify the active pharmaceutical ingredient (API) and standardize dosage instructions for a given medication.

Medication Name: "{{medicationName}}"
User-provided Dosage: "{{dosage}}"
User-provided Frequency: "{{frequency}}"

1.  Analyze the input "medicationName". Determine the primary active ingredient (generic name).
2.  Set 'isBrandName' to true if the input is a commercial brand name, and false if it's a generic name.
3.  Analyze the 'dosage' and 'frequency' inputs.
4.  Standardize the dosage (e.g., "500 mg" becomes "500mg").
5.  Standardize the frequency (e.g., "twice a day" or "BD" becomes "twice daily"; "at night" becomes "once daily at bedtime").
6.  Return the identified active ingredient in 'activeIngredient', and the standardized dosage and frequency in their respective fields.`,
});


const processMedicationFlow = ai.defineFlow(
  {
    name: 'processMedicationFlow',
    inputSchema: MedicationInfoInputSchema,
    outputSchema: MedicationInfoOutputSchema,
  },
  async (input) => {
    let retries = 3;
    while (retries > 0) {
      try {
        const { output } = await prompt(input);
        return output!;
      } catch (e: any) {
        if (e.message.includes('503')) {
          console.log("Service unavailable, retrying...");
          retries--;
          if (retries === 0) throw e;
          await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1s
        } else {
          throw e; // Re-throw other errors immediately
        }
      }
    }
    throw new Error('Failed to process medication after multiple retries.');
  }
);
