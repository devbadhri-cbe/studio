
'use client';

import * as React from 'react';

// This script is used to set the theme on the client side before hydration
// to avoid a flash of the wrong theme.
const script = `
  (function() {
    try {
      const theme = localStorage.getItem('theme');
      if (theme) {
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {}
  })();
`;

export function ThemeScript() {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
