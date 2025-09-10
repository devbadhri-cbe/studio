
'use server';
/**
 * @fileOverview An AI flow to generate and translate a synopsis for a medication.
 *
 * - getMedicationSynopsis - Generates a synopsis for a given medication.
 */
import { ai } from '@/ai/genkit';
import { MedicationSynopsisInputSchema, MedicationSynopsisOutputSchema, type MedicationSynopsisInput, type MedicationSynopsisOutput } from '@/lib/ai-types';
import { getFromCache, storeInCache } from '@/lib/ai-cache';
import { gemini15Flash } from '@genkit-ai/googleai';

const FLOW_NAME = 'getMedicationSynopsis';

export async function getMedicationSynopsis(input: MedicationSynopsisInput): Promise<MedicationSynopsisOutput> {
  const cached = await getFromCache<MedicationSynopsisOutput>(FLOW_NAME, input);
  if (cached) return cached;

  const result = await getMedicationSynopsisFlow(input);
  await storeInCache(FLOW_NAME, input, result);
  return result;
}

const prompt = ai.definePrompt({
    name: 'getMedicationSynopsisPrompt',
    input: { schema: MedicationSynopsisInputSchema },
    output: { schema: MedicationSynopsisOutputSchema },
    model: gemini15Flash,
    prompt: `You are a clinical pharmacist AI. Your task is to provide a clear, easy-to-understand synopsis for a given medication.

Medication: "{{medicationName}}"

Generate a detailed, one-paragraph summary of this medication suitable for a patient. Include its primary use, mechanism of action, common side effects, and important warnings.

Translate the final synopsis into the following language: {{language}}.`,
});


const getMedicationSynopsisFlow = ai.defineFlow(
  {
    name: 'getMedicationSynopsisFlow',
    inputSchema: MedicationSynopsisInputSchema,
    outputSchema: MedicationSynopsisOutputSchema,
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
        console.log(`Error getting medication synopsis. Retries left: ${retries}. Error: ${errorMessage}`);
        
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
