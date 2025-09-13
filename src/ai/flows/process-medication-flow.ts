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
  prompt: `You are a pharmaceutical information expert. Your task is to identify the active pharmaceutical ingredient (API), standardize dosage, and validate food instructions for a given medication.

User Input: "{{userInput}}"
User-provided Frequency: "{{frequency}}"
User-provided Food Instruction: "{{foodInstructions}}"
Patient's Country: "{{country}}"

1.  **Identify Active Ingredient**: Analyze the 'userInput' (e.g., "Rosuvas 20mg", "Tylenol PM") to determine the primary 'activeIngredient' (generic name). This is your primary task. If you cannot determine this with high confidence, do not return the 'activeIngredient' field.

2.  **Suggest Spelling Correction (Separate Task)**: Independently from the above, assess if there is a spelling mistake in the medication brand name within 'userInput'. If you are highly confident of a correction, provide a 'spellingSuggestion'. The suggestion should be a correction of the original 'userInput' string itself (e.g., for "Rosvas 10", the spelling suggestion should be "Rosuvas 10"). Check against all global brand names, but give priority to brands common in the patient's country. Provide this suggestion even if you can't find the active ingredient.

3.  **Extract Dosage**: Extract the 'dosage' from the 'userInput' string and standardize it, ensuring it includes the unit (e.g., "20 mg" becomes "20mg", "5" becomes "5mg" if that's the common dosage unit).

4.  **Identify Brand Name**: Set 'isBrandName' to true if the input is a commercial brand name, and false if it's a generic name.

5.  **Standardize Frequency**: Analyze and standardize the 'frequency' input (e.g., "twice a day" or "BD" becomes "twice daily"; "at night" becomes "once daily at bedtime").

6.  **Standardize Food Instructions**: Determine the standard food instruction for the identified 'activeIngredient' (before, after, or with food). Set this in the 'foodInstructions' output field. If this differs from the user's provided instruction, provide a brief explanation in 'foodInstructionSuggestion'.`,
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
