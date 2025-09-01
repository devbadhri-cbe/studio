
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
import { getBiomarkersForCondition } from './get-biomarkers-for-condition';

const DashboardRecommendationInputSchema = z.object({
  conditionName: z.string().describe('The name of the medical condition.'),
  icdCode: z.string().optional().describe('The ICD-11 code for the condition.'),
});
export type DashboardRecommendationInput = z.infer<typeof DashboardRecommendationInputSchema>;

const DashboardRecommendationOutputSchema = z.object({
  recommendedDashboard: z.enum(['hba1c', 'lipids', 'hypertension', 'thyroid', 'vitaminD', 'new_dashboard_needed', 'none']).describe('The key of the recommended dashboard or "new_dashboard_needed" or "none".'),
  requiredBiomarkers: z.array(z.string()).optional().describe('List of required biomarkers if a new dashboard is needed.'),
});
export type DashboardRecommendationOutput = z.infer<typeof DashboardRecommendationOutputSchema>;

const availableDashboardBiomarkers: Record<string, string[]> = {
    hba1c: ['hba1c'],
    lipids: ['ldl', 'hdl', 'triglycerides', 'total cholesterol'],
    hypertension: ['blood pressure', 'systolic', 'diastolic'],
    thyroid: ['tsh', 't3', 't4'],
    vitaminD: ['vitamin d'],
};


export async function getDashboardRecommendations(input: DashboardRecommendationInput): Promise<DashboardRecommendationOutput> {
  return getDashboardRecommendationsFlow(input);
}

const getDashboardRecommendationsFlow = ai.defineFlow(
  {
    name: 'getDashboardRecommendationsFlow',
    inputSchema: DashboardRecommendationInputSchema,
    outputSchema: DashboardRecommendationOutputSchema,
  },
  async (input) => {
    const { biomarkers } = await getBiomarkersForCondition(input);

    if (!biomarkers || biomarkers.length === 0) {
        return { recommendedDashboard: 'none' };
    }

    const lowerCaseBiomarkers = biomarkers.map(b => b.toLowerCase());

    // Check if an existing dashboard covers all required biomarkers
    for (const [dashboard, coveredBiomarkers] of Object.entries(availableDashboardBiomarkers)) {
        const areAllCovered = lowerCaseBiomarkers.every(req => 
            coveredBiomarkers.some(avail => req.includes(avail))
        );
        if (areAllCovered) {
            return { recommendedDashboard: dashboard as 'hba1c' | 'lipids' | 'hypertension' | 'thyroid' | 'vitaminD' };
        }
    }
    
    // If no existing dashboard is sufficient, recommend a new one
    return {
        recommendedDashboard: 'new_dashboard_needed',
        requiredBiomarkers: biomarkers,
    }
  }
);
