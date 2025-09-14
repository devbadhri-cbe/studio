import { z } from 'genkit';

// Define the schema for the input data. This validates the patient data passed to the flow.
export const GenerateInsightsInputSchema = z.object({
  dob: z.string().describe("Date of birth in ISO format."),
  gender: z.enum(['male', 'female', 'other']).describe("Patient's gender."),
  height: z.number().optional().describe("Height in centimeters."),
  bmi: z.number().optional().describe("Body Mass Index."),
  presentMedicalConditions: z.array(z.object({ condition: z.string() })).optional().describe("List of current medical conditions."),
  medication: z.array(z.object({ name: z.string(), dosage: z.string() })).optional().describe("List of current medications."),
  hba1cRecords: z.array(z.object({ value: z.number(), date: z.string() })).optional().describe("HbA1c records."),
  bloodPressureRecords: z.array(z.object({ systolic: z.number(), diastolic: z.number(), date: z.string() })).optional().describe("Blood pressure records."),
  fastingBloodGlucoseRecords: z.array(z.object({ value: z.number(), date: z.string() })).optional().describe("Fasting blood glucose records in mg/dL."),
});
export type GenerateInsightsInput = z.infer<typeof GenerateInsightsInputSchema>;

// Define the schema for the output. The AI will be instructed to provide a string.
export const GenerateInsightsOutputSchema = z.object({
    insight: z.string().describe("A concise, actionable health insight based on the provided patient data. Limit to 1-2 short paragraphs."),
});
export type GenerateInsightsOutput = z.infer<typeof GenerateInsightsOutputSchema>;
