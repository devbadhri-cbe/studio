
'use server';
/**
 * @fileOverview An AI flow to generate the necessary code for a new biomarker card.
 *
 * - createBiomarkerFiles - Generates and saves the .tsx files for a new biomarker.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { gemini15Flash } from '@genkit-ai/googleai';
import { writeFile } from '@/lib/services/file-writer';

//-======================================================================
//- Input and Output Schemas
//-======================================================================

const CreateBiomarkerInputSchema = z.object({
    name: z.string().describe('The name of the new biomarker (e.g., "Uric Acid").'),
    unit: z.string().describe('The unit of measurement for the biomarker (e.g., "mg/dL").'),
    key: z.string().describe('A camelCase key for the biomarker (e.g., "uricAcid").'),
    patientId: z.string().describe('The ID of the patient for whom the biomarker is being created.'),
});
export type CreateBiomarkerInput = z.infer<typeof CreateBiomarkerInputSchema>;

const CodeFileSchema = z.object({
    path: z.string().describe("The relative path within the 'src' directory where the file should be saved (e.g., 'components/uric-acid-card.tsx')."),
    content: z.string().describe("The complete, final TypeScript/TSX code for the file."),
});

const CreateBiomarkerOutputSchema = z.object({
    files: z.array(CodeFileSchema).describe('An array of code files to be created.'),
});
export type CreateBiomarkerOutput = z.infer<typeof CreateBiomarkerOutputSchema>;


//-======================================================================
//- Flow Definition
//-======================================================================

export async function createBiomarkerFiles(input: CreateBiomarkerInput): Promise<{ success: boolean; files?: { path: string }[] }> {
    const result = await createBiomarkerFlow(input);
    
    if (!result || result.files.length === 0) {
        console.error('AI did not generate any files.');
        return { success: false };
    }

    const writePromises = result.files.map(file => writeFile(file.path, file.content));
    const writeResults = await Promise.all(writePromises);

    const failedWrites = writeResults.filter(r => !r.success);
    if (failedWrites.length > 0) {
        console.error('Some files failed to write:', failedWrites);
        return { success: false };
    }

    return { success: true, files: result.files.map(f => ({ path: f.path })) };
}

const prompt = ai.definePrompt({
    name: 'createBiomarkerPrompt',
    input: { schema: CreateBiomarkerInputSchema },
    output: { schema: CreateBiomarkerOutputSchema },
    model: gemini15Flash,
    prompt: `You are an expert Next.js and React developer. Your task is to generate the code for a new biomarker Card component.

**Biomarker Details:**
- **Name**: {{name}}
- **Key**: {{key}}
- **Unit**: {{unit}}

**Your instruction is to generate the complete, final code for the following file:**

1.  **Card Component (src/components/{{key}}-card.tsx):**
    - This is the main component. It must use the existing \`BiomarkerCard\` as a wrapper.
    - It should include placeholder Chart and Dialog components.
    - It must define \`getStatus\` and \`formatRecord\` functions with appropriate placeholder logic for the new biomarker.

Generate the complete code for the file. Ensure the file path is relative to the \`src/\` directory.
`,
});

const createBiomarkerFlow = ai.defineFlow(
    {
        name: 'createBiomarkerFlow',
        inputSchema: CreateBiomarkerInputSchema,
        outputSchema: CreateBiomarkerOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        if (!output) {
            throw new Error('AI failed to generate biomarker files.');
        }
        return output;
    }
);
