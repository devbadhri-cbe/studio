
export interface Country {
    code: string;
    name: string;
    phoneCode: string;
    unitSystem: 'metric' | 'imperial';
    biomarkerUnit: 'conventional' | 'si';
    dateFormat: string;
}

export const dateFormats = [
    { format: 'MM-dd-yyyy', label: 'MM-DD-YYYY' },
    { format: 'dd-MM-yyyy', label: 'DD-MM-YYYY' },
    { format: 'yyyy-MM-dd', label: 'YYYY-MM-DD' },
    { format: 'dd.MM.yyyy', label: 'DD.MM.YYYY' },
    { format: 'dd/MM/yyyy', label: 'DD/MM/YYYY' },
    { format: 'yyyy/MM/dd', label: 'YYYY/MM/DD' },
    { format: 'PPP', label: 'Month D, YYYY' },
]

export const countries: Country[] = [
    { code: 'US', name: 'United States', phoneCode: '+1', unitSystem: 'imperial', biomarkerUnit: 'conventional', dateFormat: 'MM-dd-yyyy' },
    { code: 'IN', name: 'India', phoneCode: '+91', unitSystem: 'metric', biomarkerUnit: 'si', dateFormat: 'dd-MM-yyyy' },
    { code: 'GB', name: 'United Kingdom', phoneCode: '+44', unitSystem: 'metric', biomarkerUnit: 'si', dateFormat: 'dd-MM-yyyy' },
    { code: 'AU', name: 'Australia', phoneCode: '+61', unitSystem: 'metric', biomarkerUnit: 'si', dateFormat: 'dd-MM-yyyy' },
    { code: 'CA', name: 'Canada', phoneCode: '+1', unitSystem: 'metric', biomarkerUnit: 'si', dateFormat: 'yyyy-MM-dd' },
    { code: 'DE', name: 'Germany', phoneCode: '+49', unitSystem: 'metric', biomarkerUnit: 'si', dateFormat: 'dd.MM.yyyy' },
    { code: 'FR', name: 'France', phoneCode: '+33', unitSystem: 'metric', biomarkerUnit: 'si', dateFormat: 'dd/MM/yyyy' },
    { code: 'JP', name: 'Japan', phoneCode: '+81', unitSystem: 'metric', biomarkerUnit: 'conventional', dateFormat: 'yyyy-MM-dd' },
    { code: 'BR', name: 'Brazil', phoneCode: '+55', unitSystem: 'metric', biomarkerUnit: 'conventional', dateFormat: 'dd/MM/yyyy' },
    { code: 'ZA', name: 'South Africa', phoneCode: '+27', unitSystem: 'metric', biomarkerUnit: 'si', dateFormat: 'yyyy/MM/dd' },
    { code: 'AE', name: 'United Arab Emirates', phoneCode: '+971', unitSystem: 'metric', biomarkerUnit: 'si', dateFormat: 'dd/MM/yyyy' },
    { code: 'SG', name: 'Singapore', phoneCode: '+65', unitSystem: 'metric', biomarkerUnit: 'si', dateFormat: 'dd/MM/yyyy' },
];
