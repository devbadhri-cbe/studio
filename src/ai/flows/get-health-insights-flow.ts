
'use server';
/**
 * @fileOverview An AI flow to generate personalized health insights for a patient.
 *
 * - getHealthInsights - A function that returns a list of health tips based on patient data.
 * - GetHealthInsightsInput - The input type for the getHealthInsights function.
 * - GetHealthInsightsOutput - The return type for the getHealthInsights function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const GetHealthInsightsInputSchema = z.object({
  name: z.string().describe("The patient's name."),
  age: z.number().describe("The patient's age."),
  gender: z.enum(['male', 'female', 'other']).describe("The patient's gender."),
  country: z.string().describe("The patient's country of residence."),
  medication: z.array(z.string()).describe("A list of the patient's current medications."),
  presentMedicalConditions: z.array(z.string()).describe("A list of the patient's present medical conditions."),
  latestHba1c: z.number().optional().describe("The patient's latest HbA1c value (%)."),
  latestBloodPressure: z.object({
      systolic: z.number(),
      diastolic: z.number(),
  }).optional().describe("The patient's latest blood pressure reading."),
  latestVitaminD: z.number().optional().describe("The patient's latest Vitamin D value (ng/mL)."),
  latestThyroid: z.object({
      tsh: z.number(),
  }).optional().describe("The patient's latest TSH value (μIU/mL)."),
  bmi: z.number().optional().describe("The patient's Body Mass Index (BMI)."),
  latestGlucose: z.number().optional().describe("The patient's latest Fasting Blood Glucose value (mg/dL)."),
  latestHemoglobin: z.number().optional().describe("The patient's latest Hemoglobin value (g/dL)."),
  latestTotalCholesterol: z.number().optional().describe("The patient's latest Total Cholesterol value (mg/dL)."),
  latestLdl: z.number().optional().describe("The patient's latest LDL Cholesterol value (mg/dL)."),
  latestHdl: z.number().optional().describe("The patient's latest HDL Cholesterol value (mg/dL)."),
  latestTriglycerides: z.number().optional().describe("The patient's latest Triglycerides value (mg/dL)."),
});
export type GetHealthInsightsInput = z.infer<typeof GetHealthInsightsInputSchema>;

const GetHealthInsightsOutputSchema = z.object({
  insights: z.array(z.string()).describe('An array of 3-4 personalized health tips.'),
});
export type GetHealthInsightsOutput = z.infer<typeof GetHealthInsightsOutputSchema>;

export async function getHealthInsights(input: GetHealthInsightsInput): Promise<GetHealthInsightsOutput> {
  return getHealthInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getHealthInsightsPrompt',
  input: {schema: GetHealthInsightsInputSchema},
  output: {schema: GetHealthInsightsOutputSchema},
  model: googleAI.model('gemini-1.5-flash-latest'),
  prompt: `You are a health assistant AI. Your role is to provide safe, helpful, and personalized health tips to a user based on their latest health data.

IMPORTANT: Do not provide medical advice, diagnosis, or treatment plans. Do not suggest specific medications or dosages. Always encourage the user to consult their doctor before making any health decisions. Frame your tips as general wellness suggestions.

Generate a list of 3-4 concise, actionable, and encouraging health tips for the following user. Base the tips on the provided data, prioritizing the most relevant areas for improvement. If applicable, you can also suggest that the user might want to *discuss* a particular health screening with their doctor based on their age, gender, and health profile.

User Profile:
- Name: {{{name}}}
- Age: {{{age}}}
- Gender: {{{gender}}}
- Country: {{{country}}}
- Medical Conditions: {{#if presentMedicalConditions}}{{#each presentMedicalConditions}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None listed{{/if}}
- Current Medications: {{#if medication}}{{#each medication}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None listed{{/if}}

Latest Health Metrics:
{{#if bmi}}- Body Mass Index (BMI): {{{bmi}}}{{/if}}
{{#if latestHba1c}}- HbA1c: {{{latestHba1c}}}%{{/if}}
{{#if latestGlucose}}- Fasting Glucose: {{{latestGlucose}}} mg/dL{{/if}}
{{#if latestBloodPressure}}- Blood Pressure: {{{latestBloodPressure.systolic}}}/{{{latestBloodPressure.diastolic}}} mmHg{{/if}}
{{#if latestVitaminD}}- Vitamin D: {{{latestVitaminD}}} ng/mL{{/if}}
{{#if latestThyroid}}- TSH: {{{latestThyroid.tsh}}} μIU/mL{{/if}}
{{#if latestHemoglobin}}- Hemoglobin: {{{latestHemoglobin}}} g/dL{{/if}}
{{#if latestTotalCholesterol}}- Total Cholesterol: {{{latestTotalCholesterol}}} mg/dL{{/if}}
{{#if latestLdl}}- LDL Cholesterol: {{{latestLdl}}} mg/dL{{/if}}
{{#if latestHdl}}- HDL Cholesterol: {{{latestHdl}}} mg/dL{{/if}}
{{#if latestTriglycerides}}- Triglycerides: {{{latestTriglycerides}}} mg/dL{{/if}}

Generate the tips and return them in the 'insights' array.`,
});

const getHealthInsightsFlow = ai.defineFlow(
  {
    name: 'getHealthInsightsFlow',
    inputSchema: GetHealthInsightsInputSchema,
    outputSchema: GetHealthInsightsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
