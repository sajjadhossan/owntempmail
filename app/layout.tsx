import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Owntemp — Free Disposable Temp Mail with Custom Domain & Lifetime Lock',
  description: 'Production-ready free temporary email service with custom domain support, lifetime inbox lock, and realtime OTP extraction.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
