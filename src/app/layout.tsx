import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/app-context';
import { Toaster } from '@/components/ui/toaster';
import { Logo } from '@/components/logo';

export const metadata: Metadata = {
  title: 'Health Guardian',
  description: 'Track and manage your health metrics with AI-powered insights.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AppProvider>
          <div className="flex flex-col min-h-screen">
            {children}
          </div>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
