
'use server';

/**
 * @fileOverview Suggests a monitoring dashboard based on a medical condition.
 *
 * - getDashboardRecommendations - A function that suggests a dashboard.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DashboardRecommendationInputSchema = z.object({
  conditionName: z.string().describe('The name of the medical condition.'),
  icdCode: z.string().optional().describe('The ICD-11 code for the condition.'),
});
export type DashboardRecommendationInput = z.infer<typeof DashboardRecommendationInputSchema>;

const DashboardRecommendationOutputSchema = z.object({
  recommendedDashboard: z.enum(['hba1c', 'lipids', 'hypertension', 'thyroid', 'vitaminD', 'none']).describe('The key of the recommended dashboard or "none".'),
});
export type DashboardRecommendationOutput = z.infer<typeof DashboardRecommendationOutputSchema>;


export async function getDashboardRecommendations(input: DashboardRecommendationInput): Promise<DashboardRecommendationOutput> {
  return getDashboardRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dashboardRecommendationPrompt',
  input: {schema: DashboardRecommendationInputSchema},
  output: {schema: DashboardRecommendationOutputSchema},
  prompt: `You are a medical expert system. Based on the provided medical condition, recommend the single most relevant monitoring dashboard from the available options.

Condition: {{{conditionName}}}
{{#if icdCode}}ICD Code: {{{icdCode}}}{{/if}}

Available Dashboards and their primary biomarkers:
- 'hba1c': Monitors HbA1c for diabetes.
- 'lipids': Monitors LDL, HDL, Triglycerides for cholesterol management.
- 'hypertension': Monitors blood pressure.
- 'thyroid': Monitors TSH, T3, T4 for thyroid function.
- 'vitaminD': Monitors Vitamin D levels.

Analyze the condition and choose the most appropriate dashboard key. For example, for "Type 2 Diabetes", recommend "hba1c". For "Hypercholesterolemia", recommend "lipids". For "Hypothyroidism", recommend "thyroid". If no specific dashboard is a good fit, recommend "none".
`,
});

const getDashboardRecommendationsFlow = ai.defineFlow(
  {
    name: 'getDashboardRecommendationsFlow',
    inputSchema: DashboardRecommendationInputSchema,
    outputSchema: DashboardRecommendationOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
