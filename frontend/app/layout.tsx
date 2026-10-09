import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ZeroWaste AI',
  description: 'Architecture scaffold for ZeroWaste AI inventory management and forecasting platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
