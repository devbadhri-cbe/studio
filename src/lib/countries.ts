
export interface Country {
    code: string;
    name: string;
    phoneCode: string;
    unitSystem: 'metric' | 'imperial';
}

export const countries: Country[] = [
    { code: 'US', name: 'United States', phoneCode: '+1', unitSystem: 'imperial' },
    { code: 'IN', name: 'India', phoneCode: '+91', unitSystem: 'metric' },
    { code: 'GB', name: 'United Kingdom', phoneCode: '+44', unitSystem: 'metric' },
    { code: 'AU', name: 'Australia', phoneCode: '+61', unitSystem: 'metric' },
    { code: 'CA', name: 'Canada', phoneCode: '+1', unitSystem: 'metric' },
    { code: 'DE', name: 'Germany', phoneCode: '+49', unitSystem: 'metric' },
    { code: 'FR', name: 'France', phoneCode: '+33', unitSystem: 'metric' },
    { code: 'JP', name: 'Japan', phoneCode: '+81', unitSystem: 'metric' },
    { code: 'BR', name: 'Brazil', phoneCode: '+55', unitSystem: 'metric' },
    { code: 'ZA', name: 'South Africa', phoneCode: '+27', unitSystem: 'metric' },
    { code: 'AE', name: 'United Arab Emirates', phoneCode: '+971', unitSystem: 'metric' },
    { code: 'SG', name: 'Singapore', phoneCode: '+65', unitSystem: 'metric' },
];
