
'use server';
/**
 * @fileOverview An AI flow to generate and translate a synopsis for a medical condition.
 *
 * - getConditionSynopsis - Generates a synopsis for a given medical condition.
 * - ConditionSynopsisInput - The input type for the getConditionSynopsis function.
 * - ConditionSynopsisOutput - The return type for the getConditionSynopsis function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const ConditionSynopsisInputSchema = z.object({
  conditionName: z.string().describe('The name of the medical condition.'),
  language: z.string().optional().default('English').describe('The target language for the synopsis (e.g., "Spanish", "French").'),
});
export type ConditionSynopsisInput = z.infer<typeof ConditionSynopsisInputSchema>;

export const ConditionSynopsisOutputSchema = z.object({
  synopsis: z.string().describe('The generated synopsis in the requested language.'),
});
export type ConditionSynopsisOutput = z.infer<typeof ConditionSynopsisOutputSchema>;

export async function getConditionSynopsis(input: ConditionSynopsisInput): Promise<ConditionSynopsisOutput> {
  return getConditionSynopsisFlow(input);
}

const prompt = ai.definePrompt({
    name: 'getConditionSynopsisPrompt',
    input: { schema: ConditionSynopsisInputSchema },
    output: { schema: ConditionSynopsisOutputSchema },
    prompt: `You are a medical information expert. Your task is to provide a clear, easy-to-understand synopsis for a given medical condition.

Condition: "{{conditionName}}"

Generate a detailed, one-paragraph summary of this condition suitable for a patient. Include common symptoms, causes, and typical treatment approaches.

Translate the final synopsis into the following language: {{language}}.`,
});


const getConditionSynopsisFlow = ai.defineFlow(
  {
    name: 'getConditionSynopsisFlow',
    inputSchema: ConditionSynopsisInputSchema,
    outputSchema: ConditionSynopsisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
