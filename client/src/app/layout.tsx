import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GrowEasy CSV Importer — AI-Powered CRM Lead Import',
  description:
    'Upload any CSV file and let AI intelligently extract and map your leads into GrowEasy CRM format. Supports Facebook Leads, Google Ads, Excel exports, and more.',
  keywords: ['CSV importer', 'CRM', 'lead import', 'AI', 'GrowEasy'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
