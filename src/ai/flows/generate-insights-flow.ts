'use server';
/**
 * @fileOverview Generates health insights for a patient using an AI model.
 *
 * - generateInsights - A function that takes patient data and returns AI-powered health insights.
 * - GenerateInsightsInput - The Zod schema for the input data.
 * - GenerateInsightsOutput - The Zod schema for the output data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the schema for the input data. This validates the patient data passed to the flow.
export const GenerateInsightsInputSchema = z.object({
  dob: z.string().describe("Date of birth in ISO format."),
  gender: z.enum(['male', 'female', 'other']).describe("Patient's gender."),
  height: z.number().optional().describe("Height in centimeters."),
  bmi: z.number().optional().describe("Body Mass Index."),
  presentMedicalConditions: z.array(z.object({ condition: z.string() })).optional().describe("List of current medical conditions."),
  medication: z.array(z.object({ name: z.string(), dosage: z.string() })).optional().describe("List of current medications."),
  hba1cRecords: z.array(z.object({ value: z.number(), date: z.string() })).optional().describe("HbA1c records."),
  bloodPressureRecords: z.array(z.object({ systolic: z.number(), diastolic: z.number(), date: z.string() })).optional().describe("Blood pressure records."),
  fastingBloodGlucoseRecords: z.array(z.object({ value: z.number(), date: z.string() })).optional().describe("Fasting blood glucose records in mg/dL."),
});
export type GenerateInsightsInput = z.infer<typeof GenerateInsightsInputSchema>;

// Define the schema for the output. The AI will be instructed to provide a string.
export const GenerateInsightsOutputSchema = z.object({
    insight: z.string().describe("A concise, actionable health insight based on the provided patient data. Limit to 1-2 short paragraphs."),
});
export type GenerateInsightsOutput = z.infer<typeof GenerateInsightsOutputSchema>;

// Define the prompt that will be sent to the AI model.
const insightPrompt = ai.definePrompt({
    name: 'insightPrompt',
    input: { schema: GenerateInsightsInputSchema },
    output: { schema: GenerateInsightsOutputSchema },
    prompt: `You are a health assistant analyzing patient data. Provide a concise, helpful, and actionable insight based on the data below.
    Focus on the most critical patterns or risks. Do not give generic advice. Keep it to 1-2 short paragraphs.

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
