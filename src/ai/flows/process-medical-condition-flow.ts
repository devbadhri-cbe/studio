
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
    prompt: `You are a medical data validation expert. Your task is to analyze a user-provided medical condition.

User Input: "{{condition}}"

1.  First, determine if the input is a valid, specific medical condition. "Feeling tired" is not specific, but "Chronic Fatigue Syndrome" is.
2.  If the input is a valid condition:
    - Set 'isValid' to true.
    - You MUST provide the 'standardizedName' (e.g., for "high blood pressure," return "Hypertension").
    - You MUST provide the most likely 'icdCode' from the ICD-11 classification.
    - You MUST provide a brief, one-paragraph 'synopsis' of the condition, suitable for a patient to read.
3.  If the input is ambiguous, a symptom, or not a recognized medical condition:
    - Set 'isValid' to false.
    - Provide a list of up to 3 'suggestions' for more specific, valid medical conditions the user might have meant. For example, if the user enters "sugar problems", suggest "Type 2 Diabetes", "Hypoglycemia", "Hyperglycemia".
    - Do not provide icdCode or synopsis.`,
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

