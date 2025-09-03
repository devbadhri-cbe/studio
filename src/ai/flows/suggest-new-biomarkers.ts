
'use server';

/**
 * @fileOverview Suggests new biomarkers to monitor based on existing conditions and currently tracked biomarkers.
 *
 * - suggestNewBiomarkers - A function that returns a list of new biomarker suggestions.
 * - SuggestNewBiomarkersInput - The input type for the suggestNewBiomarkers function.
 * - SuggestNewBiomarkersOutput - The return type for the suggestNewBiomarkers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestNewBiomarkersInputSchema = z.object({
  conditions: z.array(z.string()).describe("The patient's diagnosed medical conditions."),
  currentBiomarkers: z.array(z.string()).describe('A list of biomarkers and dashboards currently being monitored.'),
});
export type SuggestNewBiomarkersInput = z.infer<typeof SuggestNewBiomarkersInputSchema>;

const SuggestNewBiomarkersOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of new, relevant biomarker names to start monitoring. The list should be empty if no new suggestions are applicable.'),
});
export type SuggestNewBiomarkersOutput = z.infer<typeof SuggestNewBiomarkersOutputSchema>;


export async function suggestNewBiomarkers(input: SuggestNewBiomarkersInput): Promise<SuggestNewBiomarkersOutput> {
  return suggestNewBiomarkersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestNewBiomarkersPrompt',
  input: {schema: SuggestNewBiomarkersInputSchema},
  output: {schema: SuggestNewBiomarkersOutputSchema},
  prompt: `You are an expert medical advisor. Based on the patient's list of diagnosed conditions, suggest any additional key biomarkers that should be monitored.

IMPORTANT: Do NOT suggest any biomarkers that are already in the "Current Biomarkers" list. Only suggest net new ones. If there are no new relevant biomarkers to suggest, return an empty list.

Patient's Diagnosed Conditions:
{{#each conditions}}
- {{{this}}}
{{/each}}

Current Biomarkers being monitored:
{{#each currentBiomarkers}}
- {{{this}}}
{{/each}}

Based on the conditions, what other important biomarkers should be tracked? Return only the names of the biomarkers.
`,
});

const suggestNewBiomarkersFlow = ai.defineFlow(
  {
    name: 'suggestNewBiomarkersFlow',
    inputSchema: SuggestNewBiomarkersInputSchema,
    outputSchema: SuggestNewBiomarkersOutputSchema,
  },
  async (input) => {
    // If there are no conditions, there's nothing to suggest.
    if (input.conditions.length === 0) {
        return { suggestions: [] };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
