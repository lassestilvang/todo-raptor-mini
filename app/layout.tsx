import './globals.css';
import type { PropsWithChildren } from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'Todo Raptor',
  description: 'Daily task planner',
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-screen text-foreground bg-background">
        {children}
      </body>
    </html>
  );
}
