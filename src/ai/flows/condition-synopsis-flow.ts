
'use server';
/**
 * @fileOverview An AI flow to generate and translate a synopsis for a medical condition.
 *
 * - getConditionSynopsis - Generates a synopsis for a given medical condition.
 */
import { ai } from '@/ai/genkit';
import { ConditionSynopsisInputSchema, ConditionSynopsisOutputSchema, type ConditionSynopsisInput, type ConditionSynopsisOutput } from '@/lib/ai-types';
import { gemini15Flash } from '@genkit-ai/googleai';

export async function getConditionSynopsis(input: ConditionSynopsisInput): Promise<ConditionSynopsisOutput> {
  return getConditionSynopsisFlow(input);
}

const prompt = ai.definePrompt({
    name: 'getConditionSynopsisPrompt',
    input: { schema: ConditionSynopsisInputSchema },
    output: { schema: ConditionSynopsisOutputSchema },
    model: gemini15Flash,
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
