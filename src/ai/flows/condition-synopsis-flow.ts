
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
        if (output) return output;

        // If output is null, it's an error and should be retried.
        throw new Error('AI returned no output.');

      } catch (e: any) {
        retries--;
        const errorMessage = e.message || '';
        console.log(`Error getting synopsis. Retries left: ${retries}. Error: ${errorMessage}`);
        
        if (retries === 0) throw e;

        // Wait longer for rate limit errors
        if (errorMessage.includes('429')) {
           await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    throw new Error('Failed to get synopsis after multiple retries.');
  }
);
