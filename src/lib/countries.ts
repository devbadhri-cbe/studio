
export interface Country {
    code: string;
    name: string;
    phoneCode: string;
}

export const countries: Country[] = [
    { code: 'US', name: 'United States', phoneCode: '+1' },
    { code: 'IN', name: 'India', phoneCode: '+91' },
    { code: 'GB', name: 'United Kingdom', phoneCode: '+44' },
    { code: 'AU', name: 'Australia', phoneCode: '+61' },
    { code: 'CA', name: 'Canada', phoneCode: '+1' },
    { code: 'DE', name: 'Germany', phoneCode: '+49' },
    { code: 'FR', name: 'France', phoneCode: '+33' },
    { code: 'JP', name: 'Japan', phoneCode: '+81' },
    { code: 'BR', name: 'Brazil', phoneCode: '+55' },
    { code: 'ZA', name: 'South Africa', phoneCode: '+27' },
    { code: 'AE', name: 'United Arab Emirates', phoneCode: '+971' },
    { code: 'SG', name: 'Singapore', phoneCode: '+65' },
];
