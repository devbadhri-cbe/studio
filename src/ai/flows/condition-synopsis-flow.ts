
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
        return output!;
      } catch (e: any) {
        if (e.message.includes('503')) {
          console.log("Service unavailable, retrying...");
          retries--;
          if (retries === 0) throw e;
          await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1s
        } else {
          throw e; // Re-throw other errors immediately
        }
      }
    }
    // This part should not be reachable if retries are handled correctly,
    // but it's here to satisfy TypeScript's requirement for a return value.
    throw new Error('Failed to get synopsis after multiple retries.');
  }
);
