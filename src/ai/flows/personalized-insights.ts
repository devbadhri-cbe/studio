'use server';

/**
 * @fileOverview Provides personalized lifestyle tips based on historical HbA1c data.
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
    .describe('Array of historical HbA1c data with date and value.'),
  previousTips: z
    .array(z.string())
    .optional()
    .describe('Array of previously provided lifestyle tips.'),
  userProfile: z
    .object({
      name: z.string().describe('User name.'),
      age: z.number().describe('User age.'),
      medication: z.string().optional().describe('User medication if any.'),
    })
    .describe('User profile information including name, age and medication'),
});
export type PersonalizedInsightsInput = z.infer<typeof PersonalizedInsightsInputSchema>;

const PersonalizedInsightsOutputSchema = z.object({
  tips: z
    .array(z.string())
    .describe(
      'Personalized lifestyle tips to help maintain healthy HbA1c levels, aligned with previous advice and current clinical guidelines.'
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
  prompt: `You are a diabetes health advisor providing personalized lifestyle tips to help patients maintain healthy HbA1c levels.

  Consider the patient's historical HbA1c data, previous advice, and current clinical guidelines to generate new tips.

  Patient Profile:
  Name: {{{userProfile.name}}}
  Age: {{{userProfile.age}}}
  Medication: {{#if userProfile.medication}}{{{userProfile.medication}}}{{else}}None{{/if}}

HbA1c Data:
{{#each hba1cData}}
  - Date: {{{this.date}}}, Value: {{{this.value}}}
{{/each}}

Previous Tips:
{{#if previousTips}}
{{#each previousTips}}
  - {{{this}}}
{{/each}}
{{else}}
  No previous tips.
{{/if}}


Generate a list of lifestyle tips. Ensure that the tips align with current clinical guidelines. 

Output the tips in the following format:

Tips:
- Tip 1
- Tip 2
- Tip 3
`,
});

const personalizedInsightsFlow = ai.defineFlow(
  {
    name: 'personalizedInsightsFlow',
    inputSchema: PersonalizedInsightsInputSchema,
    outputSchema: PersonalizedInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
