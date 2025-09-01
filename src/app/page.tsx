
'use client';

import * as React from 'react';
import PatientLoginPage from './patient/login/page';

export default function AppRootPage() {
  // As the new default entry point, this page simply renders the patient login form.
  // All complex auth state checking has been moved to the respective /doctor/* routes
  // to prevent permission errors on initial load.
  return <PatientLoginPage />;
}
