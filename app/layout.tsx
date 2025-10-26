import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Todo App - Instructions Only Claude Coding',
  description:
    'A Next.js Todo application built using Test-Driven Development (TDD) with Claude Code assistance',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <div className='min-h-screen bg-background font-sans antialiased'>
          <main className='container mx-auto px-4 py-8'>{children}</main>
        </div>
        <SpeedInsights />
      </body>
    </html>
  );
}
