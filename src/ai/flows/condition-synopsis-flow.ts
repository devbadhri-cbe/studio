
'use server';
/**
 * @fileOverview An AI flow to generate and translate a synopsis for a medical condition.
 *
 * - getConditionSynopsis - Generates a synopsis for a given medical condition.
 */
import { ai } from '@/ai/genkit';
import { ConditionSynopsisInputSchema, ConditionSynopsisOutputSchema, type ConditionSynopsisInput, type ConditionSynopsisOutput } from '@/lib/ai-types';
import { getFromCache, storeInCache } from '@/lib/ai-cache';
import { gemini15Flash } from '@genkit-ai/googleai';

const FLOW_NAME = 'getConditionSynopsis';

export async function getConditionSynopsis(input: ConditionSynopsisInput): Promise<ConditionSynopsisOutput> {
  const cached = await getFromCache<ConditionSynopsisOutput>(FLOW_NAME, input);
  if (cached) return cached;

  const result = await getConditionSynopsisFlow(input);
  await storeInCache(FLOW_NAME, input, result);
  return result;
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
    let retries = 3;
    let delay = 1000; // Initial delay of 1 second

    while (retries > 0) {
      try {
        const { output } = await prompt(input);
        if (output) return output;

        // If output is null, it's an error and should be retried.
        throw new Error('AI returned no output.');

      } catch (e: any) {
        retries--;
        const errorMessage = e.message || '';
        console.log(`Error getting synopsis. Retries left: ${retries}. Error: ${errorMessage}`);
        
        if (retries === 0) throw e;

        // Implement exponential backoff for rate limit or server unavailable errors
        if (errorMessage.includes('429') || errorMessage.includes('503')) {
           await new Promise(resolve => setTimeout(resolve, delay));
           delay *= 2; // Double the delay for the next retry
        }
      }
    }
    throw new Error('Failed to get synopsis after multiple retries.');
  }
);
