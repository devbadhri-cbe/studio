
'use server';
/**
 * @fileOverview An AI flow to extract structured biomarker data from a lab report.
 *
 * - extractBiomarkers - Extracts biomarker data from an image, assuming name is confirmed.
 */

import { ai } from '@/ai/genkit';
import { LabDataExtractionInputSchema, LabDataExtractionOutputSchema, type LabDataExtractionInput, type LabDataExtractionOutput } from '@/lib/ai-types';
import { googleAI } from '@genkit-ai/googleai';

export async function extractBiomarkers(input: LabDataExtractionInput): Promise<LabDataExtractionOutput> {
  return extractBiomarkersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractBiomarkersPrompt',
  input: { schema: LabDataExtractionInputSchema },
  output: { schema: LabDataExtractionOutputSchema },
  model: googleAI.model('gemini-pro'),
  prompt: `You are a specialized medical data entry assistant. Your task is to accurately extract structured biomarker data from the provided lab report.

Analyze the document and extract any of the following biomarkers. If a biomarker is not present, do not include it in the output. For each biomarker found, you MUST extract the date of the test. Ensure the date is in YYYY-MM-DD format.

- HbA1c (%)
- Fasting Blood Glucose (mg/dL)
- Thyroid Panel (TSH, T3, T4)
- Blood Pressure (Systolic, Diastolic, Heart Rate)
- Hemoglobin (g/dL)
- Lipid Panel (Total Cholesterol, LDL, HDL, Triglycerides, all in mg/dL)

Do not extract the patient's name.

Document to analyze: {{media url=photoDataUri}}`,
});

const extractBiomarkersFlow = ai.defineFlow(
  {
    name: 'extractBiomarkersFlow',
    inputSchema: LabDataExtractionInputSchema,
    outputSchema: LabDataExtractionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI failed to extract any lab data from the document.');
    }
    return output;
  }
);
