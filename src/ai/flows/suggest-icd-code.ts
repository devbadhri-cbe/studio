
'use server';

/**
 * @fileOverview Suggests an ICD-10 code for a given medical condition.
 *
 * - suggestIcdCode - A function that suggests an ICD-10 code.
 * - SuggestIcdCodeInput - The input type for the suggestIcdCode function.
 * - SuggestIcdCodeOutput - The return type for the suggestIcdCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestIcdCodeInputSchema = z.object({
  condition: z.string().describe('The medical condition to find an ICD-10 code for.'),
});
export type SuggestIcdCodeInput = z.infer<typeof SuggestIcdCodeInputSchema>;

const SuggestIcdCodeOutputSchema = z.object({
  icdCode: z.string().describe('The suggested ICD-10 code (e.g., E11.9).'),
  description: z.string().describe('The official description of the ICD-10 code.'),
});
export type SuggestIcdCodeOutput = z.infer<typeof SuggestIcdCodeOutputSchema>;


export async function suggestIcdCode(input: SuggestIcdCodeInput): Promise<SuggestIcdCodeOutput> {
  return suggestIcdCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestIcdCodePrompt',
  input: {schema: SuggestIcdCodeInputSchema},
  output: {schema: SuggestIcdCodeOutputSchema},
  prompt: `You are a medical coding expert. Your task is to provide the most relevant ICD-10 code for a given medical condition.

Condition: {{{condition}}}

Provide the single best ICD-10 code and its official description. Do not provide ranges or multiple options.
`,
});

const suggestIcdCodeFlow = ai.defineFlow(
  {
    name: 'suggestIcdCodeFlow',
    inputSchema: SuggestIcdCodeInputSchema,
    outputSchema: SuggestIcdCodeOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
