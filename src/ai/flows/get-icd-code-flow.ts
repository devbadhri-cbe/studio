'use server';
/**
 * @fileOverview An AI flow to get the ICD-11 code for a medical condition.
 *
 * - getIcdCode - A function that returns the ICD-11 code for a given condition.
 * - GetIcdCodeInput - The input type for the getIcdCode function.
 * - GetIcdCodeOutput - The return type for the getIcdCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetIcdCodeInputSchema = z.object({
  conditionName: z.string().describe('The name of the medical condition.'),
});
export type GetIcdCodeInput = z.infer<typeof GetIcdCodeInputSchema>;

const GetIcdCodeOutputSchema = z.object({
  icdCode: z.string().describe('The corresponding ICD-11 code for the condition.'),
});
export type GetIcdCodeOutput = z.infer<typeof GetIcdCodeOutputSchema>;


export async function getIcdCode(input: GetIcdCodeInput): Promise<GetIcdCodeOutput> {
    return getIcdCodeFlow(input);
}

const prompt = ai.definePrompt({
    name: 'getIcdCodePrompt',
    input: {schema: GetIcdCodeInputSchema},
    output: {schema: GetIcdCodeOutputSchema},
    prompt: `You are a medical coding expert. Your task is to provide the most accurate ICD-11 code for the given medical condition.

Condition: {{{conditionName}}}

Provide only the ICD-11 code.`,
});

const getIcdCodeFlow = ai.defineFlow(
    {
        name: 'getIcdCodeFlow',
        inputSchema: GetIcdCodeInputSchema,
        outputSchema: GetIcdCodeOutputSchema,
    },
    async (input) => {
        const {output} = await prompt(input);
        return output!;
    }
);
