
'use server';
/**
 * @fileOverview An AI flow to process and standardize medical conditions.
 *
 * - processMedicalCondition - Analyzes user input for a medical condition.
 */

import { ai } from '@/ai/genkit';
import { MedicalConditionInputSchema, MedicalConditionOutputSchema, type MedicalConditionInput, type MedicalConditionOutput } from '@/lib/ai-types';
import { gemini15Flash } from '@genkit-ai/googleai';

export async function processMedicalCondition(input: MedicalConditionInput): Promise<MedicalConditionOutput> {
  return processMedicalConditionFlow(input);
}

const prompt = ai.definePrompt({
    name: 'processMedicalConditionPrompt',
    input: { schema: MedicalConditionInputSchema },
    output: { schema: MedicalConditionOutputSchema },
    model: gemini15Flash,
    prompt: `You are a medical data validation expert. Your task is to analyze and standardize a user-provided medical condition.

User Input: "{{condition}}"

**Your primary goal is to find the standardized medical name and ICD-11 code for the user's input.**

1.  **Assume the user's input is a valid medical condition.** Search for its standardized name (e.g., for "high blood pressure," the standardized name is "Hypertension").
2.  You MUST provide the 'standardizedName'.
3.  You MUST provide the most likely 'icdCode' from the ICD-11 classification.
4.  You MUST provide a brief, one-paragraph 'synopsis' of the condition, suitable for a patient to read.
5.  Set 'isValid' to true.

**If, and only if, you absolutely cannot determine a specific medical condition from the input (e.g., the input is a vague symptom like "feeling tired"):**
1.  Set 'isValid' to false.
2.  Provide a list of up to 3 'suggestions' for more specific, valid medical conditions the user might have meant.
3.  Do not provide 'standardizedName', 'icdCode', or 'synopsis'.`,
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
