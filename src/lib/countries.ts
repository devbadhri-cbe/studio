
export interface Country {
    code: string;
    name: string;
    phoneCode: string;
    unitSystem: 'metric' | 'imperial';
    biomarkerUnit: 'conventional' | 'si';
}

export const countries: Country[] = [
    { code: 'US', name: 'United States', phoneCode: '+1', unitSystem: 'imperial', biomarkerUnit: 'conventional' },
    { code: 'IN', name: 'India', phoneCode: '+91', unitSystem: 'metric', biomarkerUnit: 'si' },
    { code: 'GB', name: 'United Kingdom', phoneCode: '+44', unitSystem: 'metric', biomarkerUnit: 'si' },
    { code: 'AU', name: 'Australia', phoneCode: '+61', unitSystem: 'metric', biomarkerUnit: 'si' },
    { code: 'CA', name: 'Canada', phoneCode: '+1', unitSystem: 'metric', biomarkerUnit: 'si' },
    { code: 'DE', name: 'Germany', phoneCode: '+49', unitSystem: 'metric', biomarkerUnit: 'si' },
    { code: 'FR', name: 'France', phoneCode: '+33', unitSystem: 'metric', biomarkerUnit: 'si' },
    { code: 'JP', name: 'Japan', phoneCode: '+81', unitSystem: 'metric', biomarkerUnit: 'conventional' },
    { code: 'BR', name: 'Brazil', phoneCode: '+55', unitSystem: 'metric', biomarkerUnit: 'conventional' },
    { code: 'ZA', name: 'South Africa', phoneCode: '+27', unitSystem: 'metric', biomarkerUnit: 'si' },
    { code: 'AE', name: 'United Arab Emirates', phoneCode: '+971', unitSystem: 'metric', biomarkerUnit: 'si' },
    { code: 'SG', name: 'Singapore', phoneCode: '+65', unitSystem: 'metric', biomarkerUnit: 'si' },
];
