
'use server';

/**
 * @fileOverview Identifies key biomarkers for monitoring a given medical condition.
 *
 * - getBiomarkersForCondition - A function that returns a list of biomarkers.
 * - BiomarkersForConditionInput - The input type for the getBiomarkersForCondition function.
 * - BiomarkersForConditionOutput - The return type for the getBiomarkersForCondition function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BiomarkersForConditionInputSchema = z.object({
  conditionName: z.string().describe('The name of the medical condition.'),
});
export type BiomarkersForConditionInput = z.infer<typeof BiomarkersForConditionInputSchema>;

const BiomarkersForConditionOutputSchema = z.object({
  biomarkers: z.array(z.string()).describe('A list of up to 3 key biomarkers used to monitor the specified medical condition, including their common units, e.g., ["Fasting Blood Glucose (mg/dL)", "Post-prandial Blood Glucose (mg/dL)","Serum Creatinine (mg/dL)"]'),
});
export type BiomarkersForConditionOutput = z.infer<typeof BiomarkersForConditionOutputSchema>;


export async function getBiomarkersForCondition(input: BiomarkersForConditionInput): Promise<BiomarkersForConditionOutput> {
  return getBiomarkersForConditionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'biomarkersForConditionPrompt',
  input: {schema: BiomarkersForConditionInputSchema},
  output: {schema: BiomarkersForConditionOutputSchema},
  prompt: `You are a medical expert system. For the given medical condition, identify up to three of the most critical biomarkers used for monitoring its progression and management.

For each biomarker, include its common unit of measurement in parentheses.

Condition: {{{conditionName}}}

Example Output for "Type 2 Diabetes": ["Fasting Blood Glucose (mg/dL)", "HbA1c (%)"]
Example Output for "Hypothyroidism": ["TSH (µIU/mL)", "Free T4 (ng/dL)"]

Return only the list of biomarkers.
`,
});

const getBiomarkersForConditionFlow = ai.defineFlow(
  {
    name: 'getBiomarkersForConditionFlow',
    inputSchema: BiomarkersForConditionInputSchema,
    outputSchema: BiomarkersForConditionOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
