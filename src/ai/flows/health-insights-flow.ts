
'use server';
/**
 * @fileOverview An AI flow to generate personalized health insights.
 *
 * - getHealthInsights - Generates tips based on patient data.
 */
import { ai } from '@/ai/genkit';
import { HealthInsightsInputSchema, HealthInsightsOutputSchema, type HealthInsightsInput, type HealthInsightsOutput } from '@/lib/ai-types';
import { gemini15Flash } from '@genkit-ai/googleai';

export async function getHealthInsights(input: HealthInsightsInput): Promise<HealthInsightsOutput> {
  return getHealthInsightsFlow(input);
}

const prompt = ai.definePrompt({
    name: 'getHealthInsightsPrompt',
    input: { schema: HealthInsightsInputSchema },
    output: { schema: HealthInsightsOutputSchema },
    model: gemini15Flash,
    prompt: `You are a friendly and encouraging health coach AI. Your goal is to provide personalized, actionable tips to help a user manage their health based on their latest data.

Analyze the following patient data. Generate 3-5 concise, practical, and encouraging tips. Focus on the most important areas for improvement. Tailor the advice based on their specific numbers, conditions, and demographics.

**Patient Data:**
- Age: {{patient.age}}
- Gender: {{patient.gender}}
- BMI: {{patient.bmi}}
- Conditions: {{#if patient.conditions}}{{#each patient.conditions}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None listed{{/if}}
- Medications: {{#if patient.medications}}{{#each patient.medications}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None listed{{/if}}

**Latest Lab Readings:**
- HbA1c: {{latestReadings.hba1c}}%
- Fasting Glucose: {{latestReadings.fastingBloodGlucose}} mg/dL
- Vitamin D: {{latestReadings.vitaminD}} ng/mL
- Weight: {{latestReadings.weight}} kg
- Blood Pressure: {{latestReadings.bloodPressure.systolic}}/{{latestReadings.bloodPressure.diastolic}} mmHg

**Instructions:**
1.  Review all the provided data to identify key health risks and areas for improvement.
2.  Generate a list of 3 to 5 tips. Each tip should be a short, actionable sentence.
3.  Frame the tips in a positive and encouraging tone.
4.  Do not give generic advice. Relate the tips directly to the user's data (e.g., "Your HbA1c is in the prediabetic range, so consider...").
5.  If a value is normal, you can provide a tip for maintaining it.
6.  Ensure the final tips are translated into the requested language: {{language}}.`,
});

const getHealthInsightsFlow = ai.defineFlow(
  {
    name: 'getHealthInsightsFlow',
    inputSchema: HealthInsightsInputSchema,
    outputSchema: HealthInsightsOutputSchema,
  },
  async (input) => {
    let retries = 3;
    while (retries > 0) {
      try {
        const { output } = await prompt(input);
        if (output) return output;

        // If output is null, it's an error and should be retried.
        throw new Error('AI returned no output.');

      } catch (e: any) {
        retries--;
        const errorMessage = e.message || '';
        console.log(`Error getting health insights. Retries left: ${retries}. Error: ${errorMessage}`);
        
        if (retries === 0) throw e;

        // Wait longer for rate limit errors
        if (errorMessage.includes('429')) {
           await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    throw new Error('Failed to get health insights after multiple retries.');
  }
);
