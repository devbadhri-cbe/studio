
'use server';
/**
 * @fileOverview An AI flow to generate and translate a synopsis for a medical condition.
 *
 * - getConditionSynopsis - Generates a synopsis for a given medical condition.
 */
import { ai } from '@/ai/genkit';
import { ConditionSynopsisInputSchema, ConditionSynopsisOutputSchema, type ConditionSynopsisInput, type ConditionSynopsisOutput } from '@/lib/ai-types';
import { getFromCache, storeInCache } from '@/lib/ai-cache';

export async function getConditionSynopsis(input: ConditionSynopsisInput): Promise<ConditionSynopsisOutput> {
  const cached = await getFromCache<ConditionSynopsisOutput>('getConditionSynopsisFlow', input);
  if (cached) return cached;
  
  const result = await getConditionSynopsisFlow(input);
  
  await storeInCache('getConditionSynopsisFlow', input, result);
  return result;
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
    if (!output) {
      throw new Error('AI failed to generate a synopsis for the condition.');
    }
    return output;
  }
);
