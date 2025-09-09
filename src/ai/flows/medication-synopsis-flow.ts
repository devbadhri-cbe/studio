
'use server';
/**
 * @fileOverview An AI flow to generate and translate a synopsis for a medication.
 *
 * - getMedicationSynopsis - Generates a synopsis for a given medication.
 */
import { ai } from '@/ai/genkit';
import { MedicationSynopsisInputSchema, MedicationSynopsisOutputSchema, type MedicationSynopsisInput, type MedicationSynopsisOutput } from '@/lib/ai-types';
import { gemini15Flash } from '@genkit-ai/googleai';

export async function getMedicationSynopsis(input: MedicationSynopsisInput): Promise<MedicationSynopsisOutput> {
  return getMedicationSynopsisFlow(input);
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
