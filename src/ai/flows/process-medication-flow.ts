
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

User Input: "{{userInput}}"
User-provided Frequency: "{{frequency}}"
User-provided Food Instruction: "{{foodInstructions}}"

1.  Analyze the 'userInput', which contains the medication name and potentially the dosage (e.g., "Rosuvas 20mg", "Tylenol PM").
2.  Determine the primary 'activeIngredient' (generic name) for the medication. If you cannot determine this, do not return the 'activeIngredient' field, which will signal a failure.
3.  As a separate step, assess if there is a spelling mistake in the medication name within 'userInput'. If you are highly confident of a correction, provide a 'spellingSuggestion'. You can provide this even if you can't find the active ingredient.
4.  Extract the 'dosage' from the 'userInput' string and standardize it (e.g., "20 mg" becomes "20mg").
5.  Set 'isBrandName' to true if the input is a commercial brand name, and false if it's a generic name.
6.  Analyze and standardize the 'frequency' input (e.g., "twice a day" or "BD" becomes "twice daily"; "at night" becomes "once daily at bedtime").
7.  Determine the standard food instruction for the 'activeIngredient' (before, after, or with food). Set this in the 'foodInstructions' output field.
8.  Compare the standard food instruction with the '{{foodInstructions}}'. If they differ, provide a brief explanation in 'foodInstructionSuggestion'.`,
});


const processMedicationFlow = ai.defineFlow(
  {
    name: 'processMedicationFlow',
    inputSchema: MedicationInfoInputSchema,
    outputSchema: MedicationInfoOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI failed to process the medication.');
    }
    return output;
  }
);
