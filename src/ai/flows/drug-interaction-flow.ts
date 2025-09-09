
'use server';
/**
 * @fileOverview An AI flow to check for drug-drug interactions.
 *
 * - checkDrugInteractions - Analyzes a list of medications for potential interactions.
 */
import { ai } from '@/ai/genkit';
import { DrugInteractionInputSchema, DrugInteractionOutputSchema, type DrugInteractionInput, type DrugInteractionOutput } from '@/lib/ai-types';
import { gemini15Flash } from '@genkit-ai/googleai';

export async function checkDrugInteractions(input: DrugInteractionInput): Promise<DrugInteractionOutput> {
  return checkDrugInteractionsFlow(input);
}

const prompt = ai.definePrompt({
    name: 'checkDrugInteractionsPrompt',
    input: { schema: DrugInteractionInputSchema },
    output: { schema: DrugInteractionOutputSchema },
    model: gemini15Flash,
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
    let retries = 3;
    while (retries > 0) {
      try {
        const { output } = await prompt(input);
        return output!;
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
    throw new Error('Failed to check drug interactions after multiple retries.');
  }
);
