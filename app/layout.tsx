// app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MirachAI',
  description: 'App Router root layout',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu">
      <body>{children}</body>
    </html>
  );
}