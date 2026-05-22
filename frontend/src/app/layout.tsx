import './globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terrai - Operational Control Center',
  description: 'Digital ledger and operational control center for employees, payments, vehicle movement logs, and diesel fuel tracking.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-dark-900 text-dark-50 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
