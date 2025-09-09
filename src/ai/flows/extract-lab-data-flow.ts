
'use server';
/**
 * @fileOverview An AI flow to extract structured data from lab reports.
 *
 * - extractLabData - A function that extracts biomarker data from a lab report image.
 */

import { ai } from '@/ai/genkit';
import { LabDataExtractionInputSchema, LabDataExtractionOutputSchema, type LabDataExtractionInput, type LabDataExtractionOutput } from '@/lib/ai-types';

export async function extractLabData(input: LabDataExtractionInput): Promise<LabDataExtractionOutput> {
  return extractLabDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractLabDataPrompt',
  input: { schema: LabDataExtractionInputSchema },
  output: { schema: LabDataExtractionOutputSchema },
  prompt: `You are a specialized medical data entry assistant. Your task is to accurately extract biomarker data from an image of a patient's lab report.

Analyze the provided image and extract any of the following biomarkers. If a biomarker is not present, do not include it in the output. For each biomarker found, you MUST extract the date of the test. Ensure the date is in YYYY-MM-DD format.

- HbA1c (%)
- Fasting Blood Glucose (mg/dL)
- Vitamin D (25-OH) (value and units)
- Thyroid Panel (TSH, T3, T4)
- Blood Pressure (Systolic, Diastolic, Heart Rate)
- Hemoglobin (g/dL)
- Lipid Panel (Total Cholesterol, LDL, HDL, Triglycerides, all in mg/dL)

Image to analyze: {{media url=photoDataUri}}`,
});

const extractLabDataFlow = ai.defineFlow(
  {
    name: 'extractLabDataFlow',
    inputSchema: LabDataExtractionInputSchema,
    outputSchema: LabDataExtractionOutputSchema,
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
        console.log(`Error extracting lab data. Retries left: ${retries}. Error: ${errorMessage}`);
        
        if (retries === 0) throw e;

        // Wait longer for rate limit errors
        if (errorMessage.includes('429')) {
           await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    // This part should not be reachable if retries are handled correctly,
    // but it's here to satisfy TypeScript's requirement for a return value.
    throw new Error('Failed to extract lab data after multiple retries.');
  }
);
