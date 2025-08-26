
'use server';

/**
 * @fileOverview Provides personalized lifestyle tips based on historical health data.
 *
 * - getPersonalizedInsights - A function that generates personalized lifestyle tips.
 * - PersonalizedInsightsInput - The input type for the getPersonalizedInsights function.
 * - PersonalizedInsightsOutput - The return type for the getPersonalizedInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedInsightsInputSchema = z.object({
  hba1cData: z
    .array(z.object({date: z.string(), value: z.number()}))
    .optional()
    .describe('Array of historical HbA1c data with date and value.'),
  lipidData: z
    .array(z.object({
      date: z.string(),
      ldl: z.number(),
      hdl: z.number(),
      triglycerides: z.number(),
      total: z.number()
    }))
    .optional()
    .describe('Array of historical lipid data.'),
  previousTips: z
    .array(z.string())
    .optional()
    .describe('Array of previously provided lifestyle tips.'),
  userProfile: z
    .object({
      name: z.string().describe('User name.'),
      age: z.number().describe('User age.'),
      gender: z.enum(['male', 'female', 'other']).describe('User gender.'),
      presentMedicalConditions: z.array(z.object({
        date: z.string(),
        condition: z.string(),
        icdCode: z.string().optional(),
      })).optional().describe('User medical conditions.'),
      medication: z.string().optional().describe('User medication if any.'),
    })
    .describe('User profile information including name, age, gender and medication'),
});
export type PersonalizedInsightsInput = z.infer<typeof PersonalizedInsightsInputSchema>;

const PersonalizedInsightsOutputSchema = z.object({
  tips: z
    .array(z.string())
    .describe(
      'Personalized lifestyle tips to help maintain healthy biomarker levels, aligned with previous advice and current clinical guidelines.'
    ),
});
export type PersonalizedInsightsOutput = z.infer<typeof PersonalizedInsightsOutputSchema>;

export async function getPersonalizedInsights(input: PersonalizedInsightsInput): Promise<PersonalizedInsightsOutput> {
  return personalizedInsightsFlow(input);
}

const lifestyleTipsTool = ai.defineTool({
    name: 'checkIfTipsAligned',
    description: 'Check if a new lifestyle tip aligns with previously provided lifestyle tips.',
    inputSchema: z.object({
        newTip: z.string().describe('The new lifestyle tip to validate.'),
        previousTips: z.array(z.string()).describe('Previously provided lifestyle tips.'),
    }),
    outputSchema: z.boolean().describe('True if the new tip aligns with the previous tips, false otherwise.'),
    async execute(input) {
        //For now always returns true, but this could be updated to compare tips
        return true;
    }
});

const prompt = ai.definePrompt({
  name: 'personalizedInsightsPrompt',
  input: {schema: PersonalizedInsightsInputSchema},
  output: {schema: PersonalizedInsightsOutputSchema},
  tools: [lifestyleTipsTool],
  prompt: `You are an expert health advisor providing personalized lifestyle tips to help patients manage their health.

Your advice should be holistic, considering all available health data. Analyze the patient's age, gender, medical history, and their most recent HbA1c and lipid panel results to generate relevant, actionable tips. Ensure your recommendations are consistent with current clinical guidelines for managing diabetes, prediabetes, and cholesterol.

Patient Profile:
Name: {{{userProfile.name}}}
Age: {{{userProfile.age}}}
Gender: {{{userProfile.gender}}}
Present Medical Conditions: {{#if userProfile.presentMedicalConditions}}{{#each userProfile.presentMedicalConditions}}{{{this.condition}}} (Diagnosed: {{this.date}}), {{/each}}{{else}}None{{/if}}
Medication: {{#if userProfile.medication}}{{{userProfile.medication}}}{{else}}None{{/if}}

{{#if hba1cData}}
Historical HbA1c Data (most recent first):
{{#each hba1cData}}
  - Date: {{{this.date}}}, Value: {{{this.value}}}%
{{/each}}
{{/if}}

{{#if lipidData}}
Historical Lipid Data (most recent first):
{{#each lipidData}}
  - Date: {{{this.date}}}, Total: {{{this.total}}}, LDL: {{{this.ldl}}}, HDL: {{{this.hdl}}}, Triglycerides: {{{this.triglycerides}}}
{{/each}}
{{/if}}

Previous Tips Provided:
{{#if previousTips}}
{{#each previousTips}}
  - {{{this}}}
{{/each}}
{{else}}
  No previous tips.
{{/if}}

Generate a list of new, personalized lifestyle tips based on a complete analysis of the patient's profile and data. If both HbA1c and lipid data are present, provide integrated tips that address both aspects of their health. The tips should be fresh and not repetitive of previous advice.
`,
});

const personalizedInsightsFlow = ai.defineFlow(
  {
    name: 'personalizedInsightsFlow',
    inputSchema: PersonalizedInsightsInputSchema,
    outputSchema: PersonalizedInsightsOutputSchema,
  },
  async input => {
    // Sort data to ensure the prompt receives the most recent records first
    if (input.hba1cData) {
      input.hba1cData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    if (input.lipidData) {
      input.lipidData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    
    const {output} = await prompt(input);
    return output!;
  }
);
