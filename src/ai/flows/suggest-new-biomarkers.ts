
'use server';

/**
 * @fileOverview Suggests a monitoring dashboard based on a medical condition.
 *
 * - suggestNewBiomarkers - A function that suggests a dashboard.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NewBiomarkersInputSchema = z.object({
  conditionName: z.string().describe('The name of the medical condition.'),
  icdCode: z.string().optional().describe('The ICD-11 code for the condition.'),
});
export type NewBiomarkersInput = z.infer<typeof NewBiomarkersInputSchema>;

const NewBiomarkersOutputSchema = z.object({
  recommendedDashboard: z.enum(['diabetes', 'lipids', 'hypertension', 'thyroid', 'vitaminD', 'renal', 'none']).describe('The key of the recommended dashboard or "none".'),
});
export type NewBiomarkersOutput = z.infer<typeof NewBiomarkersOutputSchema>;


export async function suggestNewBiomarkers(input: NewBiomarkersInput): Promise<NewBiomarkersOutput> {
  return suggestNewBiomarkersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'newBiomarkersPrompt',
  input: {schema: NewBiomarkersInputSchema},
  output: {schema: NewBiomarkersOutputSchema},
  prompt: `You are a medical expert system. Based on the provided medical condition, recommend the single most relevant monitoring dashboard from the available options.

Condition: {{{conditionName}}}
{{#if icdCode}}ICD Code: {{{icdCode}}}{{/if}}

Available Dashboards and their primary focus:
- 'diabetes': Monitors biomarkers related to diabetes like HbA1c, glucose, weight, and anemia.
- 'lipids': Monitors LDL, HDL, Triglycerides for cholesterol management.
- 'hypertension': Monitors blood pressure.
- 'thyroid': Monitors TSH, T3, T4 for thyroid function.
- 'vitaminD': Monitors Vitamin D levels.
- 'renal': Monitors eGFR and UACR for kidney function.

Analyze the condition and choose the most appropriate dashboard key. For example, for "Type 2 Diabetes", recommend "diabetes". For "Hypercholesterolemia", recommend "lipids". For "Chronic Kidney Disease", recommend "renal". If no specific dashboard is a good fit, recommend "none".
`,
});

const suggestNewBiomarkersFlow = ai.defineFlow(
  {
    name: 'suggestNewBiomarkersFlow',
    inputSchema: NewBiomarkersInputSchema,
    outputSchema: NewBiomarkersOutputSchema,
  },
  async (input) => {
    if (!input.conditionName) {
      return { recommendedDashboard: 'none' };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
