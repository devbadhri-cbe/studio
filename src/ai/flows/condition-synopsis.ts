
'use server';

/**
 * @fileOverview Generates a patient-friendly synopsis for a given medical condition.
 *
 * - getConditionSynopsis - A function that returns a synopsis for a medical condition.
 * - ConditionSynopsisInput - The input type for the getConditionSynopsis function.
 * - ConditionSynopsisOutput - The return type for the getConditionSynopsis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConditionSynopsisInputSchema = z.object({
  conditionName: z.string().describe('The name of the medical condition to get a synopsis for.'),
});
export type ConditionSynopsisInput = z.infer<typeof ConditionSynopsisInputSchema>;

const ConditionSynopsisOutputSchema = z.object({
  synopsis: z.string().describe('A patient-friendly synopsis of the medical condition, including its description, common symptoms, and general treatment approaches, preceded by a disclaimer.'),
});
export type ConditionSynopsisOutput = z.infer<typeof ConditionSynopsisOutputSchema>;


export async function getConditionSynopsis(input: ConditionSynopsisInput): Promise<ConditionSynopsisOutput> {
  return conditionSynopsisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'conditionSynopsisPrompt',
  input: {schema: ConditionSynopsisInputSchema},
  output: {schema: ConditionSynopsisOutputSchema},
  prompt: `You are an expert medical assistant providing patient-friendly information. Your task is to generate a concise synopsis for the following medical condition: {{{conditionName}}}

The synopsis should be easy for a layperson to understand and include:
1.  **What it is:** A brief, simple description of the condition.
2.  **Common Symptoms:** A short list of common symptoms.
3.  **General Treatment Approaches:** A brief, high-level overview of how it's typically managed.

IMPORTANT: Your response MUST begin with the following disclaimer, exactly as written:
"DISCLAIMER: This information is for educational purposes only and is not a substitute for professional medical advice. Always consult your doctor for personalized diagnosis and treatment."

After the disclaimer, provide the synopsis.
`,
});

const conditionSynopsisFlow = ai.defineFlow(
  {
    name: 'conditionSynopsisFlow',
    inputSchema: ConditionSynopsisInputSchema,
    outputSchema: ConditionSynopsisOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
