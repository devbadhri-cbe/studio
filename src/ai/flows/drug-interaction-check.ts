'use server';

/**
 * @fileOverview Checks for potential drug interactions between a list of medications.
 *
 * - checkDrugInteractions - A function that checks for drug interactions.
 * - DrugInteractionInput - The input type for the checkDrugInteractions function.
 * - DrugInteractionOutput - The return type for the checkDrugInteractions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DrugInteractionInputSchema = z.object({
    medications: z.array(z.string()).describe('A list of medication names to check for interactions.'),
});
export type DrugInteractionInput = z.infer<typeof DrugInteractionInputSchema>;

const DrugInteractionOutputSchema = z.object({
    interactionSummary: z.string().describe('A summary of potential drug interactions, including risks and a disclaimer.'),
});
export type DrugInteractionOutput = z.infer<typeof DrugInteractionOutputSchema>;


export async function checkDrugInteractions(input: DrugInteractionInput): Promise<DrugInteractionOutput> {
  return drugInteractionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'drugInteractionPrompt',
  input: {schema: DrugInteractionInputSchema},
  output: {schema: DrugInteractionOutputSchema},
  prompt: `You are an expert clinical pharmacologist. Your task is to check for potential interactions between the following medications:

{{#each medications}}
- {{{this}}}
{{/each}}

Analyze the potential interactions, focusing on the most clinically relevant and significant risks. Provide a summary of your findings.

IMPORTANT: Your response MUST begin with the following disclaimer, exactly as written:
"DISCLAIMER: This is an AI-generated analysis and is not a substitute for professional medical advice. The information provided is for educational purposes only. Always consult with a qualified healthcare provider or pharmacist before making any decisions about your medication regimen."

After the disclaimer, provide the interaction summary. If there are no significant interactions, state that clearly.
`,
});

const drugInteractionFlow = ai.defineFlow(
  {
    name: 'drugInteractionFlow',
    inputSchema: DrugInteractionInputSchema,
    outputSchema: DrugInteractionOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
