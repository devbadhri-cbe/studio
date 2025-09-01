
'use server';

/**
 * @fileOverview Identifies key biomarkers to monitor for a given medical condition.
 *
 * - getBiomarkersForCondition - A function that returns key biomarkers for a condition.
 * - BiomarkersForConditionInput - The input type for the function.
 * - BiomarkersForConditionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BiomarkersForConditionInputSchema = z.object({
  conditionName: z.string().describe('The name of the medical condition.'),
  icdCode: z.string().optional().describe('The ICD-11 code for the condition.'),
});
export type BiomarkersForConditionInput = z.infer<typeof BiomarkersForConditionInputSchema>;

const BiomarkersForConditionOutputSchema = z.object({
  biomarkers: z.array(z.string()).describe('A list of essential biomarkers for monitoring the condition.'),
});
export type BiomarkersForConditionOutput = z.infer<typeof BiomarkersForConditionOutputSchema>;

export async function getBiomarkersForCondition(input: BiomarkersForConditionInput): Promise<BiomarkersForConditionOutput> {
  return getBiomarkersForConditionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'biomarkersForConditionPrompt',
  input: {schema: BiomarkersForConditionInputSchema},
  output: {schema: BiomarkersForConditionOutputSchema},
  prompt: `You are a medical expert specializing in diagnostics. Based on the provided medical condition, identify the most critical biomarkers that should be monitored.

Condition: {{{conditionName}}}
{{#if icdCode}}ICD Code: {{{icdCode}}}{{/if}}

Return a list of the key biomarkers. For example, for "Type 2 Diabetes", you would return ["HbA1c"]. For "Hypercholesterolemia", you would return ["LDL", "HDL", "Total Cholesterol", "Triglycerides"]. For "Chronic Kidney Disease", return ["eGFR", "UACR", "Serum Creatinine"].

Return only the list of biomarker names.
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
