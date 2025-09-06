
'use server';
/**
 * @fileOverview An AI flow to suggest a monitoring plan for a medical condition.
 *
 * - suggestMonitoringPlan - A function that returns a suggested panel and biomarkers.
 * - SuggestMonitoringPlanInput - The input type for the suggestMonitoringPlan function.
 * - SuggestMonitoringPlanOutput - The return type for the suggestMonitoringPlan function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const SuggestMonitoringPlanInputSchema = z.object({
  conditionName: z.string().describe('The name of the medical condition.'),
  existingPanels: z.array(z.string()).describe('A list of existing disease panel keys (e.g., "diabetes", "hypertension", "lipids").'),
});
export type SuggestMonitoringPlanInput = z.infer<typeof SuggestMonitoringPlanInputSchema>;

const SuggestMonitoringPlanOutputSchema = z.object({
    panelName: z.string().describe('The suggested name for the panel (e.g., Diabetes Panel, Kidney Health Panel). If an existing panel is a good fit, use its name.'),
    isNewPanel: z.boolean().describe('Whether this is a new panel that needs to be created, or an existing one being recommended.'),
    biomarkers: z.array(z.string()).describe('An array of 2-4 essential biomarker names for MONITORING this condition (e.g., ["Creatinine", "eGFR"]).'),
});
export type SuggestMonitoringPlanOutput = z.infer<typeof SuggestMonitoringPlanOutputSchema>;


export async function suggestMonitoringPlan(input: SuggestMonitoringPlanInput): Promise<SuggestMonitoringPlanOutput> {
    return suggestMonitoringPlanFlow(input);
}

const prompt = ai.definePrompt({
    name: 'suggestMonitoringPlanPrompt',
    input: {schema: SuggestMonitoringPlanInputSchema},
    output: {schema: SuggestMonitoringPlanOutputSchema},
    model: googleAI.model('gemini-1.5-flash-latest'),
    prompt: `You are an expert clinical assistant AI. Your task is to recommend a monitoring plan for a given medical condition.

You are aware of the following existing disease panels in the system:
{{#each existingPanels}}
- {{this}}
{{/each}}

Analyze the provided condition:
Condition: {{{conditionName}}}

1.  First, determine if one of the existing panels is a suitable fit for monitoring this condition.
    - If a condition is related to high blood sugar, recommend the "Diabetes Panel". Set panelName to "Diabetes Panel" and isNewPanel to false.
    - If a condition is related to high blood pressure, recommend the "Hypertension Panel". Set panelName to "Hypertension Panel" and isNewPanel to false.
    - If a condition is related to high cholesterol or triglycerides, recommend the "Lipids Panel". Set panelName to "Lipids Panel" and isNewPanel to false.
    - If none of the existing panels are a perfect fit, devise a suitable name for a NEW panel (e.g., for "Chronic Kidney Disease", a good name would be "Kidney Health Panel"). Set isNewPanel to true.

2.  Second, identify a list of 2 to 4 of the MOST IMPORTANT biomarkers for *monitoring* the progression of this disease in a primary care setting. Do not list every possible test, only the most essential ones for ongoing tracking.

Return the response in the required JSON format.`,
});

const suggestMonitoringPlanFlow = ai.defineFlow(
    {
        name: 'suggestMonitoringPlanFlow',
        inputSchema: SuggestMonitoringPlanInputSchema,
        outputSchema: SuggestMonitoringPlanOutputSchema,
    },
    async (input) => {
        const {output} = await prompt(input);
        return output!;
    }
);
