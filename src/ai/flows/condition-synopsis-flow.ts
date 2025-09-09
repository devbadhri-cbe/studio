
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
    let retries = 3;
    while (retries > 0) {
      try {
        const { output } = await prompt(input);
        if (!output) throw new Error("No output from AI");
        return output;
      } catch (e: any) {
        const errorMessage = e.message || '';
        if (errorMessage.includes('429') || errorMessage.includes('503')) {
          console.log(`Service unavailable or rate limited (${errorMessage.includes('429') ? '429' : '503'}), retrying...`);
          retries--;
          if (retries === 0) throw e;
          // Wait longer for rate limit errors
          const delay = errorMessage.includes('429') ? 1000 : 0;
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw e; // Re-throw other errors immediately
        }
      }
    }
    throw new Error('Failed to get synopsis after multiple retries.');
  }
);
