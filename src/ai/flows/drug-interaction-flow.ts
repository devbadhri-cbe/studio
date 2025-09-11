
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
        if (output) return output;

        // If output is null, it's an error and should be retried.
        throw new Error('AI returned no output.');

      } catch (e: any) {
        retries--;
        const errorMessage = e.message || '';
        console.log(`Error checking interactions. Retries left: ${retries}. Error: ${errorMessage}`);
        
        if (retries === 0) throw e;

        // Wait longer for rate limit or server unavailable errors
        if (errorMessage.includes('429') || errorMessage.includes('503')) {
           await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    throw new Error('Failed to check drug interactions after multiple retries.');
  }
);
