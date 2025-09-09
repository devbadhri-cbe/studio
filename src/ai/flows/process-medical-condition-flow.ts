
'use server';
/**
 * @fileOverview An AI flow to process and standardize medical conditions.
 *
 * - processMedicalCondition - Analyzes user input for a medical condition.
 * - MedicalConditionInput - The input type for the processMedicalCondition function.
 * - MedicalConditionOutput - The return type for the processMedicalCondition function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const MedicalConditionInputSchema = z.object({
  condition: z.string().describe('The medical condition entered by the user.'),
  existingConditions: z.array(z.string()).optional().describe('A list of existing conditions the patient already has.'),
});
export type MedicalConditionInput = z.infer<typeof MedicalConditionInputSchema>;

export const MedicalConditionOutputSchema = z.object({
    isValid: z.boolean().describe('Whether the input is a recognized medical condition.'),
    standardizedName: z.string().optional().describe('The standardized medical name for the condition.'),
    icdCode: z.string().optional().describe('The ICD-11 code for the condition.'),
    synopsis: z.string().optional().describe('A brief, easy-to-understand synopsis of the condition.'),
    suggestions: z.array(z.string()).optional().describe('A list of suggested valid condition names if the input is ambiguous or not recognized.'),
});
export type MedicalConditionOutput = z.infer<typeof MedicalConditionOutputSchema>;

export async function processMedicalCondition(input: MedicalConditionInput): Promise<MedicalConditionOutput> {
  return processMedicalConditionFlow(input);
}

const prompt = ai.definePrompt({
    name: 'processMedicalConditionPrompt',
    input: { schema: MedicalConditionInputSchema },
    output: { schema: MedicalConditionOutputSchema },
    prompt: `You are a medical data validation expert. Your task is to analyze a user-provided medical condition.

User Input: "{{condition}}"
Existing Conditions: {{#if existingConditions}}{{#each existingConditions}}- {{this}}\n{{/each}}{{else}}None{{/if}}

1.  Determine if the input is a valid, specific medical condition. "Feeling tired" is not specific, but "Chronic Fatigue Syndrome" is.
2.  If the input is a valid condition:
    - Set 'isValid' to true.
    - Provide the 'standardizedName' (e.g., for "high blood pressure," return "Hypertension").
    - Find and provide the most likely 'icdCode' from the ICD-11 classification.
    - Provide a brief, one-paragraph 'synopsis' of the condition, suitable for a patient to read.
3.  If the input is ambiguous, a symptom, or not a recognized medical condition:
    - Set 'isValid' to false.
    - Provide a list of up to 3 'suggestions' for more specific, valid medical conditions the user might have meant. For example, if the user enters "sugar problems", suggest "Type 2 Diabetes", "Hypoglycemia", "Hyperglycemia".
    - Do not provide icdCode or synopsis.
4. If the condition is already in the 'Existing Conditions' list, set isValid to false and provide no suggestions.`,
});

const processMedicalConditionFlow = ai.defineFlow(
  {
    name: 'processMedicalConditionFlow',
    inputSchema: MedicalConditionInputSchema,
    outputSchema: MedicalConditionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
