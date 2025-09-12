
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
2.  Determine the primary active ingredient (generic name) for the medication.
3.  Extract the dosage from the 'userInput' string. Standardize it (e.g., "20 mg" becomes "20mg").
4.  Set 'isBrandName' to true if the input is a commercial brand name, and false if it's a generic name.
5.  Analyze and standardize the 'frequency' input (e.g., "twice a day" or "BD" becomes "twice daily"; "at night" becomes "once daily at bedtime").
6.  Determine the standard food instruction for the 'activeIngredient' (before, after, or with food). Set this in the 'foodInstructions' output field.
7.  Compare the standard food instruction with the '{{foodInstructions}}'. If they differ, provide a brief explanation in 'foodInstructionSuggestion'. For example: "Rosuvastatin can be taken with or without food. Changed from 'before food' to 'with food' for better tolerance."
8.  Return the identified active ingredient, standardized dosage, and other information in their respective fields.`,
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

    