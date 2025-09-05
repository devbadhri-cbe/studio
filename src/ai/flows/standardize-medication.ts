
'use server';

/**
 * @fileOverview Standardizes medication name, dosage, and frequency.
 *
 * - standardizeMedication - A function that takes user input for medication and returns a standardized version.
 * - StandardizeMedicationInput - The input type for the standardizeMedication function.
 * - StandardizeMedicationOutput - The return type for the standardizeMedication function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StandardizeMedicationInputSchema = z.object({
  medicationName: z.string().describe('The name of the medication as entered by the user.'),
  dosage: z.string().describe('The dosage as entered by the user (e.g., "10mg", "25 mg").'),
  frequency: z.string().describe('The frequency as entered by the user (e.g., "1", "daily", "twice a day").'),
});
export type StandardizeMedicationInput = z.infer<typeof StandardizeMedicationInputSchema>;

const StandardizeMedicationOutputSchema = z.object({
  name: z.string().describe('The corrected and properly capitalized generic medication name.'),
  brandName: z.string().optional().describe('The original brand name if it is different from the generic name.'),
  dosage: z.string().describe('The standardized dosage (e.g., "10 mg").'),
  frequency: z.string().describe('The standardized frequency (e.g., "Once daily", "Twice daily").'),
});
export type StandardizeMedicationOutput = z.infer<typeof StandardizeMedicationOutputSchema>;


export async function standardizeMedication(input: StandardizeMedicationInput): Promise<StandardizeMedicationOutput> {
  return standardizeMedicationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'standardizeMedicationPrompt',
  input: {schema: StandardizeMedicationInputSchema},
  output: {schema: StandardizeMedicationOutputSchema},
  prompt: `You are a clinical data normalization engine. Your task is to take user-provided medication information and standardize it.

User Input:
- Medication Name: {{{medicationName}}}
- Dosage: {{{dosage}}}
- Frequency: {{{frequency}}}

Instructions:
1.  **Medication Name:** Identify the pharmacological (generic) name of the medication. If the user enters a brand name (e.g., Lipitor), convert it to its generic name (e.g., Atorvastatin). Correct any spelling errors and ensure the final generic name is properly capitalized.
2.  **Brand Name:** If the user-entered medication name is a brand name and is different from the generic name you identified, return the original user input in the 'brandName' field. Otherwise, leave it blank.
3.  **Dosage:** Standardize the dosage format. Ensure there is a space between the number and the unit (e.g., "10mg" becomes "10 mg").
4.  **Frequency:** Standardize the frequency description. Convert numerical or shorthand inputs into a clear, human-readable format.
    - "1" or "daily" should become "Once daily".
    - "2" or "twice a day" should become "Twice daily".
    - "BD" or "BID" should become "Twice daily".
    - "TDS" or "TID" should become "Three times daily".
    - "QDS" or "QID" should become "Four times daily".
    - "SOS" should become "As needed".
    - "HS" or "at night" should become "At bedtime".

Return the standardized information in the specified output format.
`,
});

const standardizeMedicationFlow = ai.defineFlow(
  {
    name: 'standardizeMedicationFlow',
    inputSchema: StandardizeMedicationInputSchema,
    outputSchema: StandardizeMedicationOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
