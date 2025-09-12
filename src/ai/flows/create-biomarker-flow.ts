
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
    prompt: `You are an expert Next.js and React developer tasked with creating the necessary .tsx files for a new health biomarker card in an existing application.

You MUST generate three separate files:
1.  **Card Component**: This component brings everything together. It MUST use the existing 'BiomarkerCard' as a template.
2.  **Chart Component**: A simple line chart to visualize the biomarker data over time.
3.  **Dialog Component**: A dialog for adding new records of this biomarker.

**Instructions:**

-   **Biomarker Name**: {{name}}
-   **Biomarker Key (for props and state)**: {{key}}
-   **Unit of Measurement**: {{unit}}

**Card Component Requirements (e.g., src/components/{{key}}-card.tsx):**
-   Import and use the 'BiomarkerCard' component from '@/components/biomarker-card'.
-   Create a new 'Add...Dialog' component and pass it to the 'addRecordDialog' prop.
-   Create a new '...Chart' component and pass it to the 'chart' prop.
-   Define a 'getStatus' function with placeholder logic (e.g., return 'Normal').
-   Define a 'formatRecord' function to display the value and unit.
-   Use a suitable icon from 'lucide-react'.

**Chart Component Requirements (e.g., src/components/{{key}}-chart.tsx):**
-   Use 'recharts' to create a simple 'LineChart'.
-   Include placeholder text for when there is no data.
-   Display the value and unit in the tooltip.

**Dialog Component Requirements (e.g., src/components/add-{{key}}-record-dialog.tsx):**
-   Use the 'AddRecordDialogLayout' component.
-   Include a 'DatePicker' and a numerical 'Input' for the value.
-   Use 'zod' for basic form validation (e.g., required date, positive number).
-   Call the appropriate 'add...Record' function from the 'useApp' context on submit.

Generate the complete code for all three files. Ensure all paths are relative to the 'src/directory.
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
