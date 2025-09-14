
'use server';
/**
 * @fileOverview Generates health insights for a patient using an AI model.
 *
 * - generateInsights - A function that takes patient data and returns AI-powered health insights.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { GenerateInsightsInputSchema, GenerateInsightsOutputSchema, type GenerateInsightsInput, type GenerateInsightsOutput } from '@/lib/ai-types';


// Define the prompt that will be sent to the AI model.
const insightPrompt = ai.definePrompt({
    name: 'insightPrompt',
    model: googleAI.model('gemini-1.5-flash'),
    input: { schema: GenerateInsightsInputSchema },
    output: { schema: GenerateInsightsOutputSchema },
    prompt: `You are a health advisor. Based on the patient's age (derived from DOB) and gender, provide a list of recommended, age-appropriate screening tests.
    If other health data is available, such as medical conditions or biomarker values, briefly mention how that might influence the recommendations, but the primary focus should be on preventative screening.
    Keep the output concise and in a clear, easy-to-read format. Do not give generic advice.

    Patient Data:
    - Date of Birth: {{dob}}
    - Gender: {{gender}}
    {{#if height}}- Height (cm): {{height}}{{/if}}
    {{#if bmi}}- BMI: {{bmi}}{{/if}}
    
    {{#if presentMedicalConditions}}
    Medical Conditions:
    {{#each presentMedicalConditions}}
    - {{this.condition}}
    {{/each}}
    {{/if}}

    {{#if medication}}
    Medications:
    {{#each medication}}
    - {{this.name}} ({{this.dosage}})
    {{/each}}
    {{/if}}

    {{#if hba1cRecords}}
    Recent HbA1c:
    {{#each hba1cRecords}}
    - {{this.value}}% on {{this.date}}
    {{/each}}
    {{/if}}

    {{#if bloodPressureRecords}}
    Recent Blood Pressure:
    {{#each bloodPressureRecords}}
    - {{this.systolic}}/{{this.diastolic}} mmHg on {{this.date}}
    {{/each}}
    {{/if}}

    {{#if fastingBloodGlucoseRecords}}
    Recent Fasting Glucose:
    {{#each fastingBloodGlucoseRecords}}
    - {{this.value}} mg/dL on {{this.date}}
    {{/each}}
    {{/if}}
    `,
});

// Define the main flow for generating insights.
const generateInsightsFlow = ai.defineFlow(
  {
    name: 'generateInsightsFlow',
    inputSchema: GenerateInsightsInputSchema,
    outputSchema: GenerateInsightsOutputSchema,
  },
  async (input) => {
    const { output } = await insightPrompt(input);
    if (!output) {
      throw new Error('No output from AI model.');
    }
    return output;
  }
);

// Exported wrapper function to be called from the frontend.
export async function generateInsights(input: GenerateInsightsInput): Promise<GenerateInsightsOutput> {
  return generateInsightsFlow(input);
}
