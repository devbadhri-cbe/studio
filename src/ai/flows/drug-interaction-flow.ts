
'use server';
/**
 * @fileOverview An AI flow to check for drug-drug interactions.
 *
 * - checkDrugInteractions - Analyzes a list of medications for potential interactions.
 */
import { ai } from '@/ai/genkit';
import { DrugInteractionInputSchema, DrugInteractionOutputSchema, type DrugInteractionInput, type DrugInteractionOutput } from '@/lib/ai-types';
import { getFromCache, storeInCache } from '@/lib/ai-cache';

export async function checkDrugInteractions(input: DrugInteractionInput): Promise<DrugInteractionOutput> {
  const cached = await getFromCache<DrugInteractionOutput>('checkDrugInteractionsFlow', input);
  if (cached) return cached;

  const result = await checkDrugInteractionsFlow(input);
  
  await storeInCache('checkDrugInteractionsFlow', input, result);
  return result;
}

const prompt = ai.definePrompt({
    name: 'checkDrugInteractionsPrompt',
    input: { schema: DrugInteractionInputSchema },
    output: { schema: DrugInteractionOutputSchema },
    prompt: `You are a clinical pharmacist AI. Your task is to analyze a list of medications for potential drug-drug interactions.

Medications:
{{#each medications}}
- {{this}}
{{/each}}

1.  Review the list of medications provided.
2.  Identify any clinically significant drug-drug interactions.
3.  If interactions are found:
    - Set 'hasInteractions' to true.
    - Provide a 'summary' that lists each interacting pair and briefly explains the potential effect in simple, clear terms for a patient.
4.  If no significant interactions are found:
    - Set 'hasInteractions' to false.
    - Provide a 'summary' stating that no major interactions were detected among the listed medications, but remind the user to always consult their doctor or pharmacist.
5.  Your summary should be concise and easy to understand. Avoid overly technical jargon.
6.  Translate the final summary into the following language: {{language}}.`,
});

const checkDrugInteractionsFlow = ai.defineFlow(
  {
    name: 'checkDrugInteractionsFlow',
    inputSchema: DrugInteractionInputSchema,
    outputSchema: DrugInteractionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI failed to generate a drug interaction summary.');
    }
    return output;
  }
);
