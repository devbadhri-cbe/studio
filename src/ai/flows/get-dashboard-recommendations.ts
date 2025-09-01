
'use server';

/**
 * @fileOverview Suggests a monitoring dashboard based on a medical condition.
 *
 * - getDashboardRecommendations - A function that suggests a dashboard.
 * - DashboardRecommendationInput - The input type for the function.
 * - DashboardRecommendationOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DashboardRecommendationInputSchema = z.object({
  conditionName: z.string().describe('The name of the medical condition.'),
  icdCode: z.string().optional().describe('The ICD-11 code for the condition.'),
});
export type DashboardRecommendationInput = z.infer<typeof DashboardRecommendationInputSchema>;

const DashboardRecommendationOutputSchema = z.object({
  recommendedDashboard: z.enum(['hba1c', 'lipids', 'hypertension', 'thyroid', 'none']).describe('The key of the recommended dashboard (hba1c, lipids, hypertension, thyroid) or "none".'),
});
export type DashboardRecommendationOutput = z.infer<typeof DashboardRecommendationOutputSchema>;

export async function getDashboardRecommendations(input: DashboardRecommendationInput): Promise<DashboardRecommendationOutput> {
  return getDashboardRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dashboardRecommendationPrompt',
  input: {schema: DashboardRecommendationInputSchema},
  output: {schema: DashboardRecommendationOutputSchema},
  prompt: `You are a medical informatics expert. Your task is to recommend a monitoring dashboard for a given medical condition. Map the condition to the most relevant dashboard key.

Condition: {{{conditionName}}}
ICD Code: {{{icdCode}}}

Available dashboard keys are: 'hba1c', 'lipids', 'hypertension', 'thyroid'.

- If the condition is related to diabetes or blood sugar (e.g., Type 2 Diabetes, Prediabetes, 5A10-5A14), recommend 'hba1c'.
- If the condition is related to cholesterol or heart disease risk (e.g., Hypercholesterolemia, 5B50-5B5Z), recommend 'lipids'.
- If the condition is related to blood pressure (e.g., Hypertension, BA00-BA0Z), recommend 'hypertension'.
- If the condition is related to the thyroid (e.g., Hypothyroidism, 5A00-5A0Z), recommend 'thyroid'.
- For anything else, recommend 'none'.

Return only the single best dashboard key.
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
