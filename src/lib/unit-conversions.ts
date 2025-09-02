

// Conversion Factors
const LIPID_CONVERSION_FACTOR_LDL_HDL_TOTAL = 0.0259;
const LIPID_CONVERSION_FACTOR_TRIG = 0.0113;
const VITAMIN_D_CONVERSION_FACTOR = 2.496;
const GLUCOSE_CONVERSION_FACTOR = 18.018;
const HEMOGLOBIN_CONVERSION_FACTOR = 10;


/**
 * Converts lipid values from mg/dL to mmol/L.
 * @param value The value in mg/dL.
 * @param type The type of lipid ('ldl', 'hdl', 'total', or 'triglycerides').
 * @returns The value in mmol/L.
 */
export function toMmolL(value: number, type: 'ldl' | 'hdl' | 'total' | 'triglycerides' | 'glucose'): number {
  if (type === 'triglycerides') {
    return value * LIPID_CONVERSION_FACTOR_TRIG;
  }
  if (type === 'glucose') {
    return value / GLUCOSE_CONVERSION_FACTOR;
  }
  return value * LIPID_CONVERSION_FACTOR_LDL_HDL_TOTAL;
}

/**
 * Converts lipid values from mmol/L to mg/dL.
 * @param value The value in mmol/L.
 * @param type The type of lipid ('ldl', 'hdl', 'total', or 'triglycerides').
 * @returns The value in mg/dL.
 */
export function toMgDl(value: number, type: 'ldl' | 'hdl' | 'total' | 'triglycerides' | 'glucose'): number {
  if (type === 'triglycerides') {
    return value / LIPID_CONVERSION_FACTOR_TRIG;
  }
  if (type === 'glucose') {
    return value * GLUCOSE_CONVERSION_FACTOR;
  }
  return value / LIPID_CONVERSION_FACTOR_LDL_HDL_TOTAL;
}

/**
 * Converts Vitamin D values from ng/mL to nmol/L.
 * @param value The value in ng/mL.
 * @returns The value in nmol/L.
 */
export function toNmolL(value: number): number {
    return value * VITAMIN_D_CONVERSION_FACTOR;
}

/**
 * Converts Vitamin D values from nmol/L to ng/mL.
 * @param value The value in nmol/L.
 * @returns The value in ng/mL.
 */
export function toNgDl(value: number): number {
    return value / VITAMIN_D_CONVERSION_FACTOR;
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
