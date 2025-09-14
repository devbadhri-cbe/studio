
'use server';
/**
 * @fileOverview An AI flow to generate and translate a synopsis for a medication.
 *
 * - getMedicationSynopsis - Generates a synopsis for a given medication.
 */
import { ai } from '@/ai/genkit';
import { MedicationSynopsisInputSchema, MedicationSynopsisOutputSchema, type MedicationSynopsisInput, type MedicationSynopsisOutput } from '@/lib/ai-types';
import { getFromCache, storeInCache } from '@/lib/ai-cache';

export async function getMedicationSynopsis(input: MedicationSynopsisInput): Promise<MedicationSynopsisOutput> {
  const cached = await getFromCache<MedicationSynopsisOutput>('getMedicationSynopsisFlow', input);
  if (cached) return cached;
  
  const result = await getMedicationSynopsisFlow(input);

  await storeInCache('getMedicationSynopsisFlow', input, result);
  return result;
}

const prompt = ai.definePrompt({
    name: 'getMedicationSynopsisPrompt',
    input: { schema: MedicationSynopsisInputSchema },
    output: { schema: MedicationSynopsisOutputSchema },
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
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI failed to generate a synopsis for the medication.');
    }
    return output;
  }
);
