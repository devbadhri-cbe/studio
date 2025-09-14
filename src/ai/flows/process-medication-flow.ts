
'use server';
/**
 * @fileOverview An AI flow to identify the active ingredient of a medication.
 *
 * - getMedicationInfo - Analyzes a medication name to find its active ingredient.
 */

import { ai } from '@/ai/genkit';
import { MedicationInfoInputSchema, MedicationInfoOutputSchema, type MedicationInfoInput, type MedicationInfoOutput } from '@/lib/ai-types';
import { getFromCache, storeInCache } from '@/lib/ai-cache';

export async function getMedicationInfo(input: MedicationInfoInput): Promise<MedicationInfoOutput> {
  const cached = await getFromCache<MedicationInfoOutput>('processMedicationFlow', input);
  if (cached) return cached;
  
  const result = await processMedicationFlow(input);
  
  await storeInCache('processMedicationFlow', input, result);
  return result;
}

const prompt = ai.definePrompt({
  name: 'processMedicationPrompt',
  input: { schema: MedicationInfoInputSchema },
  output: { schema: MedicationInfoOutputSchema },
  prompt: `You are a pharmaceutical information expert. Your task is to identify the active pharmaceutical ingredient (API), standardize dosage, and validate food instructions for a given medication.

User Input: "{{userInput}}"
User-provided Frequency: "{{frequency}}"
User-provided Food Instruction: "{{foodInstructions}}"
Patient's Country: "{{country}}"

**Task Breakdown:**

1.  **Identify Active Ingredient (Primary Task)**: Analyze the 'userInput' (e.g., "Rosuvas 20mg", "Tylenol PM") to determine the primary 'activeIngredient' (generic name). If you cannot determine this with high confidence, do not return the 'activeIngredient' field.

2.  **Suggest Spelling Correction (Independent Task)**:
    a.  Assess if there's a likely spelling mistake in the medication brand name within the 'userInput'.
    b.  Compare the original input to both the identified active ingredient and to a list of known global brand names, prioritizing those common in the patient's specified 'country'.
    c.  If you find a very close brand name match (e.g., user enters "Rosvas", you find "Rosuvas"), your 'spellingSuggestion' MUST be the corrected brand name string (e.g., "Rosuvas 10mg").
    d.  Only if no close brand name is found, but you are confident about the active ingredient, you may suggest the active ingredient (e.g., "Rosuvastatin 10mg").

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
