
'use server';
/**
 * @fileOverview An AI flow to identify the active ingredient of a medication.
 *
 * - getMedicationInfo - Analyzes a medication name to find its active ingredient.
 */

import { ai } from '@/ai/genkit';
import { MedicationInfoInputSchema, MedicationInfoOutputSchema, type MedicationInfoInput, type MedicationInfoOutput } from '@/lib/ai-types';
import { getFromCache, storeInCache } from '@/lib/ai-cache';
import { gemini15Flash } from '@genkit-ai/googleai';

const FLOW_NAME = 'getMedicationInfo';

export async function getMedicationInfo(input: MedicationInfoInput): Promise<MedicationInfoOutput> {
  return processMedicationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'processMedicationPrompt',
  input: { schema: MedicationInfoInputSchema },
  output: { schema: MedicationInfoOutputSchema },
  model: gemini15Flash,
  prompt: `You are a pharmaceutical information expert. Your task is to identify the active pharmaceutical ingredient (API), standardize dosage, and validate food instructions for a given medication.

Medication Name: "{{medicationName}}"
User-provided Dosage: "{{dosage}}"
User-provided Frequency: "{{frequency}}"
User-provided Food Instruction: "{{foodInstructions}}"

1.  Analyze the input "medicationName", which could be a brand or generic name. Check for common spelling mistakes. If you identify a likely correction, populate the 'correctedMedicationName' field with the correct spelling.
2.  Determine the primary active ingredient (generic name) for the corrected medication name (or the original if no correction was needed).
3.  Set 'isBrandName' to true if the input is a commercial brand name, and false if it's a generic name.
4.  Analyze the 'dosage' and 'frequency' inputs.
5.  Standardize the dosage (e.g., "500 mg" becomes "500mg").
6.  Standardize the frequency (e.g., "twice a day" or "BD" becomes "twice daily"; "at night" becomes "once daily at bedtime").
7.  Determine the standard food instruction for the 'activeIngredient' (before, after, or with food). Set this in the 'foodInstructions' output field.
8.  Compare the standard food instruction with the '{{foodInstructions}}'. If they differ, provide a brief explanation in 'foodInstructionSuggestion'. For example: "Rosuvastatin can be taken with or without food. Changed from 'before food' to 'with food' for better tolerance."
9.  Return the identified active ingredient in 'activeIngredient', and the standardized information in their respective fields.`,
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
        if (output) return output;
        
        // If output is null, it's an error and should be retried.
        throw new Error('AI returned no output.');

      } catch (e: any) {
        retries--;
        const errorMessage = e.message || '';
        console.log(`Error processing medication. Retries left: ${retries}. Error: ${errorMessage}`);
        
        if (retries === 0) throw e;

        // Wait longer for rate limit errors
        if (errorMessage.includes('429')) {
           await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    throw new Error('Failed to process medication after multiple retries.');
  }
);
