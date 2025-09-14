
'use server';
/**
 * @fileOverview An AI flow to process and standardize medical conditions.
 *
 * - processMedicalCondition - Analyzes user input for a medical condition.
 */

import { ai } from '@/ai/genkit';
import { MedicalConditionInputSchema, MedicalConditionOutputSchema, type MedicalConditionInput, type MedicalConditionOutput } from '@/lib/ai-types';
import { getFromCache, storeInCache } from '@/lib/ai-cache';

export async function processMedicalCondition(input: MedicalConditionInput): Promise<MedicalConditionOutput> {
  const cached = await getFromCache<MedicalConditionOutput>('processMedicalConditionFlow', input);
  if (cached) return cached;
  
  const result = await processMedicalConditionFlow(input);
  
  await storeInCache('processMedicalConditionFlow', input, result);
  return result;
}

const prompt = ai.definePrompt({
    name: 'processMedicalConditionPrompt',
    input: { schema: MedicalConditionInputSchema },
    output: { schema: MedicalConditionOutputSchema },
    model: 'gemini-pro',
    prompt: `You are a medical data validation expert. Your task is to analyze, correct, and standardize a user-provided medical condition.

User Input: "{{condition}}"

**Your primary goal is to find the standardized medical name and ICD-11 code for the user's input.**

1.  Analyze the user's input for spelling mistakes, grammatical errors, or colloquialisms (e.g., "high blood sugar" -> "Hyperglycemia" or "Diabetes").
2.  Determine the most likely, specific medical condition the user is referring to. This will be the 'standardizedName'.
3.  If you believe the user made a mistake, provide a 'suggestion' with the corrected, full name (e.g., if user input is "Hypertenson", suggestion should be "Hypertension").
4.  You MUST provide the most likely 'icdCode' from the ICD-11 classification for the identified condition.
5.  You MUST provide a brief, one-paragraph 'synopsis' of the condition, suitable for a patient to read.
6.  Set 'isValid' to true if you could successfully identify a condition.

**If, and only if, you absolutely cannot determine a specific medical condition from the input (e.g., the input is too vague like "feeling tired" or nonsensical):**
1.  Set 'isValid' to false.
2.  Do not provide 'standardizedName', 'icdCode', or 'synopsis'.`,
});

const processMedicalConditionFlow = ai.defineFlow(
  {
    name: 'processMedicalConditionFlow',
    inputSchema: MedicalConditionInputSchema,
    outputSchema: MedicalConditionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI failed to process the medical condition.');
    }
    return output;
  }
);
