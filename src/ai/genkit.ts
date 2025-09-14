
import { genkit, GenerationCommonConfigSchema } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

const safetySettings = [
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_ONLY_HIGH',
  },
   {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_ONLY_HIGH',
  },
];

const config: Partial<z.infer<typeof GenerationCommonConfigSchema>> = {
  safetySettings,
};


export const ai = genkit({
    plugins: [
        googleAI({
            apiVersion: 'v1beta',
            safetySettings,
        }),
    ],
    defaultModel: {
      model: 'gemini-pro',
      config,
    },
});
