

'use server';
/**
 * @fileOverview An AI flow to extract structured data from a lab report document.
 *
 * - extractLabResults - A function that analyzes an image of a lab report.
 * - ExtractLabResultsInput - The input type for the function.
 * - ExtractLabResultsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractLabResultsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a lab report, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractLabResultsInput = z.infer<typeof ExtractLabResultsInputSchema>;

const BiomarkerResultSchema = z.object({
    biomarker: z.string().describe('The name of the biomarker test (e.g., "HbA1c", "Vitamin D", "TSH").'),
    value: z.number().describe('The numerical value of the result.'),
    unit: z.string().describe('The unit of measurement for the result (e.g., "%", "ng/mL", "μIU/mL").'),
});

const ExtractLabResultsOutputSchema = z.object({
  patientName: z.string().describe("The full name of the patient as it appears on the report."),
  testDate: z.string().describe("The date the tests were conducted, formatted as 'YYYY-MM-DD'."),
  results: z.array(BiomarkerResultSchema).describe('An array of all the biomarker results found on the page.'),
});
export type ExtractLabResultsOutput = z.infer<typeof ExtractLabResultsOutputSchema>;

export async function extractLabResults(input: ExtractLabResultsInput): Promise<ExtractLabResultsOutput> {
  return extractLabResultsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractLabResultsPrompt',
  input: {schema: ExtractLabResultsInputSchema},
  output: {schema: ExtractLabResultsOutputSchema},
  prompt: `You are an expert at analyzing medical lab reports.
Your task is to meticulously extract the following information from the provided document image:
1. The patient's full name.
2. The date the lab tests were performed. Please format this as YYYY-MM-DD.
3. A list of all available biomarker results. For each result, provide the biomarker name, its numerical value, and its unit of measurement.

Known Biomarkers to look for:
- HbA1c (in %)
- Fasting Blood Glucose (in mg/dL or mmol/L)
- Vitamin D (in ng/mL or nmol/L)
- TSH (in μIU/mL)
- T3 (in pg/mL)
- T4 (in ng/dL)
- Hemoglobin (in g/dL or g/L)

If you cannot find a piece of information, leave it out of the response. Be as accurate as possible.

Document to analyze: {{media url=photoDataUri}}`,
});

const extractLabResultsFlow = ai.defineFlow(
  {
    name: 'extractLabResultsFlow',
    inputSchema: ExtractLabResultsInputSchema,
    outputSchema: ExtractLabResultsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
