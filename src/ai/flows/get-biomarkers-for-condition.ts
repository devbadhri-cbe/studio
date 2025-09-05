
'use server';

/**
 * @fileOverview Identifies a key monitoring dashboard for a given medical condition.
 *
 * - getBiomarkersForCondition - A function that returns a recommended dashboard.
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
  recommendedDashboard: z.enum(['diabetes', 'lipids', 'hypertension', 'thyroid', 'vitaminD', 'renal', 'none']).describe('The key of the recommended dashboard or "none".'),
});
export type BiomarkersForConditionOutput = z.infer<typeof BiomarkersForConditionOutputSchema>;


export async function getBiomarkersForCondition(input: BiomarkersForConditionInput): Promise<BiomarkersForConditionOutput> {
  return getBiomarkersForConditionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'biomarkersForConditionPrompt',
  input: {schema: BiomarkersForConditionInputSchema},
  output: {schema: BiomarkersForConditionOutputSchema},
  prompt: `You are a medical expert system. Based on the provided medical condition, recommend the single most relevant monitoring dashboard from the available options.

Condition: {{{conditionName}}}

Available Dashboards and their primary focus:
- 'diabetes': Monitors biomarkers related to diabetes like HbA1c, glucose, weight, and anemia.
- 'lipids': Monitors LDL, HDL, Triglycerides for cholesterol management.
- 'hypertension': Monitors blood pressure.
- 'thyroid': Monitors TSH, T3, T4 for thyroid function.
- 'vitaminD': Monitors Vitamin D levels.
- 'renal': Monitors eGFR and UACR for kidney function.

Analyze the condition and choose the most appropriate dashboard key. For "Type 2 Diabetes", recommend "diabetes". For "Hypercholesterolemia", recommend "lipids". For "Chronic Kidney Disease", recommend "renal". For "High Blood Pressure", recommend "hypertension". If no specific dashboard is a good fit, recommend "none".
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
