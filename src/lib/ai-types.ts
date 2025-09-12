
import { z } from 'zod';

/**
 * @fileoverview This file contains all the Zod schemas and TypeScript types
 * for the AI flows in the application. Centralizing these definitions helps
 * to avoid "use server" conflicts and provides a single source of truth for
 * AI-related data structures.
 */

//-================================================================----------
//- Condition Synopsis Flow Types
//-================================================================----------

export const ConditionSynopsisInputSchema = z.object({
  conditionName: z.string().describe('The name of the medical condition.'),
  language: z.string().optional().default('English').describe('The target language for the synopsis (e.g., "Spanish", "French").'),
});
export type ConditionSynopsisInput = z.infer<typeof ConditionSynopsisInputSchema>;

export const ConditionSynopsisOutputSchema = z.object({
  synopsis: z.string().describe('The generated synopsis in the requested language.'),
});
export type ConditionSynopsisOutput = z.infer<typeof ConditionSynopsisOutputSchema>;

//-================================================================----------
//- Lab Data Extraction Flow Types
//-================================================================----------

export const LabDataExtractionInputSchema = z.object({
  photoDataUri: z.string().describe("A photo of a lab report, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type LabDataExtractionInput = z.infer<typeof LabDataExtractionInputSchema>;

export const LabDataExtractionOutputSchema = z.object({
  patientName: z.string().optional().describe("The full name of the patient as it appears on the lab report."),
  hba1c: z
    .object({
      date: z.string().describe('The date of the test in YYYY-MM-DD format.'),
      value: z.number().describe('The HbA1c value as a percentage.'),
    })
    .optional()
    .describe('Hemoglobin A1c test result.'),
  fastingBloodGlucose: z
    .object({
      date: z.string().describe('The date of the test in YYYY-MM-DD format.'),
      value: z.number().describe('The fasting blood glucose value in mg/dL.'),
    })
    .optional()
    .describe('Fasting Blood Glucose test result.'),
  thyroid: z
    .object({
      date: z.string().describe('The date of the test in YYYY-MM-DD format.'),
      tsh: z.number().optional().describe('Thyroid-Stimulating Hormone value.'),
      t3: z.number().optional().describe('Triiodothyronine value.'),
      t4: z.number().optional().describe('Thyroxine value.'),
    })
    .optional()
    .describe('Thyroid panel results.'),
  bloodPressure: z
    .object({
      date: z.string().describe('The date of the test in YYYY-MM-D format.'),
      systolic: z.number().describe('The systolic blood pressure value.'),
      diastolic: z.number().describe('The diastolic blood pressure value.'),
      heartRate: z.number().optional().describe('The heart rate in beats per minute.'),
    })
    .optional()
    .describe('Blood pressure reading.'),
  hemoglobin: z
    .object({
      date: z.string().describe('The date of the test in YYYY-MM-DD format.'),
      hemoglobin: z.number().describe('The hemoglobin value in g/dL.'),
    })
    .optional()
    .describe('Hemoglobin test result.'),
  lipidPanel: z
    .object({
      date: z.string().describe('The date of the test in YYYY-MM-DD format.'),
      totalCholesterol: z.number().optional().describe('Total cholesterol value in mg/dL.'),
      ldl: z.number().optional().describe('LDL cholesterol value in mg/dL.'),
      hdl: z.number().optional().describe('HDL cholesterol value in mg/dL.'),
      triglycerides: z.number().optional().describe('Triglycerides value in mg/dL.'),
    })
    .optional()
    .describe('Full lipid panel results.'),
});
export type LabDataExtractionOutput = z.infer<typeof LabDataExtractionOutputSchema>;


//-================================================================----------
//- Medical Condition Processing Flow Types
//-================================================================----------

export const MedicalConditionInputSchema = z.object({
  condition: z.string().describe('The medical condition entered by the user.'),
});
export type MedicalConditionInput = z.infer<typeof MedicalConditionInputSchema>;

export const MedicalConditionOutputSchema = z.object({
    isValid: z.boolean().describe('Whether the input is a recognized medical condition.'),
    standardizedName: z.string().optional().describe('The standardized medical name for the condition.'),
    icdCode: z.string().optional().describe('The ICD-11 code for the condition.'),
    synopsis: z.string().optional().describe('A brief, easy-to-understand synopsis of the condition.'),
    suggestions: z.array(z.string()).optional().describe('A list of suggested valid condition names if the input is ambiguous or not recognized.'),
});
export type MedicalConditionOutput = z.infer<typeof MedicalConditionOutputSchema>;

//-================================================================----------
//- Medication Processing Flow Types
//-================================================================----------

export const MedicationInfoInputSchema = z.object({
  userInput: z.string().describe('The full medication text entered by the user, including name and dosage (e.g., "Nebicard 5mg").'),
  frequency: z.string().optional().describe('The user-provided frequency (e.g., "twice a day", "at bedtime").'),
  foodInstructions: z.enum(['before', 'after', 'with']).optional().describe('The user-provided food instruction.'),
});
export type MedicationInfoInput = z.infer<typeof MedicationInfoInputSchema>;

export const MedicationInfoOutputSchema = z.object({
  activeIngredient: z.string().describe('The active pharmaceutical ingredient (API) or generic name of the medication.'),
  isBrandName: z.boolean().describe('Whether the user input was identified as a brand name.'),
  dosage: z.string().optional().describe('The standardized dosage extracted from the user input (e.g., "5mg").'),
  frequency: z.string().optional().describe('The standardized frequency (e.g., "twice daily").'),
  foodInstructions: z.enum(['before', 'after', 'with']).optional().describe('The standard food instruction for this medication.'),
  foodInstructionSuggestion: z.string().optional().describe('A brief explanation if the user\'s food instruction was incorrect and why it was corrected.'),
  spellingSuggestion: z.string().optional().describe('A suggested correction for the medication name if a spelling error is suspected.'),
});
export type MedicationInfoOutput = z.infer<typeof MedicationInfoOutputSchema>;

//-================================================================----------
//- Drug Interaction Flow Types
//-================================================================----------

export const DrugInteractionInputSchema = z.object({
    medications: z.array(z.string()).describe('A list of medications to check for interactions. Each string should contain the medication name and dosage, e.g., ["Lisinopril 10mg", "Aspirin 81mg"]').min(2, 'At least two medications are required.'),
    language: z.string().optional().default('English').describe('The target language for the summary (e.g., "Spanish", "French").'),
});
export type DrugInteractionInput = z.infer<typeof DrugInteractionInputSchema>;

export const DrugInteractionOutputSchema = z.object({
    hasInteractions: z.boolean().describe('Whether any significant drug-drug interactions were found.'),
    summary: z.string().describe('A concise, easy-to-understand summary of the findings. If no interactions are found, it should state that clearly. If interactions are found, it should list each interacting pair and the potential effect.'),
});
export type DrugInteractionOutput = z.infer<typeof DrugInteractionOutputSchema>;


//-================================================================----------
//- Medication Synopsis Flow Types
//-================================================================----------

export const MedicationSynopsisInputSchema = z.object({
  medicationName: z.string().describe('The name of the medication.'),
  language: z.string().optional().default('English').describe('The target language for the synopsis (e.g., "Spanish", "French").'),
});
export type MedicationSynopsisInput = z.infer<typeof MedicationSynopsisInputSchema>;

export const MedicationSynopsisOutputSchema = z.object({
  synopsis: z.string().describe('The generated synopsis in the requested language.'),
});
export type MedicationSynopsisOutput = z.infer<typeof MedicationSynopsisOutputSchema>;

//-================================================================----------
//- Health Insights Flow Types
//-================================================================----------

const patientContextSchema = z.object({
    age: z.number().optional().describe('The age of the patient in years.'),
    gender: z.enum(['male', 'female', 'other']).optional().describe('The gender of the patient.'),
    bmi: z.number().optional().describe('The Body Mass Index of the patient.'),
    conditions: z.array(z.string()).optional().describe('A list of the patient\'s existing medical conditions.'),
    medications: z.array(z.string()).optional().describe('A list of the patient\'s current medications.'),
});

const latestReadingsSchema = z.object({
    hba1c: z.number().optional().describe('The latest HbA1c reading (%).'),
    fastingBloodGlucose: z.number().optional().describe('The latest fasting blood glucose reading in mg/dL.'),
    weight: z.number().optional().describe('The latest weight reading in kg.'),
    bloodPressure: z.object({
        systolic: z.number(),
        diastolic: z.number(),
    }).optional().describe('The latest blood pressure reading.'),
});

export const HealthInsightsInputSchema = z.object({
    language: z.string().optional().default('English').describe('The target language for the insights (e.g., "Spanish", "French").'),
    patient: patientContextSchema,
    latestReadings: latestReadingsSchema,
});
export type HealthInsightsInput = z.infer<typeof HealthInsightsInputSchema>;

export const HealthInsightsOutputSchema = z.object({
    tips: z.array(z.string()).describe('An array of 3-5 personalized, actionable health tips.'),
});
export type HealthInsightsOutput = z.infer<typeof HealthInsightsOutputSchema>;

    
