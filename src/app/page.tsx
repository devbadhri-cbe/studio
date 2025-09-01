
'use client';

import * as React from 'react';
import PatientLoginPage from './patient/login/page';

export default function AppRootPage() {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // To prevent hydration errors, we only render the client-side
  // login page after the initial mount.
  return isClient ? <PatientLoginPage /> : null;
}
