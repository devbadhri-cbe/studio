
// Conversion Factors
const GLUCOSE_CONVERSION_FACTOR = 18.018;
const HEMOGLOBIN_CONVERSION_FACTOR = 10;
const LDL_HDL_TOTAL_CHOLESTEROL_CONVERSION_FACTOR = 38.67;
const TRIGLYCERIDES_CONVERSION_FACTOR = 88.57;

type LipidType = 'total' | 'ldl' | 'hdl' | 'triglycerides' | 'glucose';


/**
 * Converts lipid values from mg/dL to mmol/L.
 * @param value The value in mg/dL.
 * @param type The type of lipid ('ldl', 'hdl', 'total', or 'triglycerides').
 * @returns The value in mmol/L.
 */
export function toMmolL(value: number, type: LipidType): number {
  switch (type) {
    case 'glucose':
      return value / GLUCOSE_CONVERSION_FACTOR;
    case 'triglycerides':
      return value / TRIGLYCERIDES_CONVERSION_FACTOR;
    case 'ldl':
    case 'hdl':
    case 'total':
      return value / LDL_HDL_TOTAL_CHOLESTEROL_CONVERSION_FACTOR;
    default:
      return value;
  }
}

/**
 * Converts lipid values from mmol/L to mg/dL.
 * @param value The value in mmol/L.
 * @param type The type of lipid ('ldl', 'hdl', 'total', or 'triglycerides').
 * @returns The value in mg/dL.
 */
export function toMgDl(value: number, type: LipidType): number {
  switch (type) {
    case 'glucose':
      return value * GLUCOSE_CONVERSION_FACTOR;
    case 'triglycerides':
      return value * TRIGLYCERIDES_CONVERSION_FACTOR;
    case 'ldl':
    case 'hdl':
    case 'total':
      return value * LDL_HDL_TOTAL_CHOLESTEROL_CONVERSION_FACTOR;
    default:
      return value;
  }
}

/**
 * Converts Hemoglobin from g/dL to g/L.
 * @param value The value in g/dL.
 * @returns The value in g/L.
 */
export function toGL(value: number): number {
    return value * HEMOGLOBIN_CONVERSION_FACTOR;
}

/**
 * Converts Hemoglobin from g/L to g/dL.
 * @param value The value in g/L.
 * @returns The value in g/dL.
 */
export function toGDL(value: number): number {
    return value / HEMOGLOBIN_CONVERSION_FACTOR;
}
