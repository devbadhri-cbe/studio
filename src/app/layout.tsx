import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/app-context';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';


export const metadata: Metadata = {
  title: 'Health Guardian Lite',
  description: 'A patient-centric application for tracking key health biomarkers, with a primary focus on blood glucose (HbA1c) management, enhanced with AI-powered insights and reminders.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  other: {
    "application-name": "Health Guardian Lite",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Health Guardian Lite",
    "format-detection": "telephone=no",
    "mobile-web-app-capable": "yes",
    "theme-color": "#A1C9F7",
  },
  
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
       <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&family=Poppins:wght@600;700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="border-4 border-blue-500 box-border">
        <TooltipProvider>
            <AppProvider>
              <div className="flex flex-col min-h-screen pt-[env(safe-area-inset-top)]">
                {children}
              </div>
              <Toaster />
            </AppProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
