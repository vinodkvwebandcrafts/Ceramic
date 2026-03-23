import type { Metadata } from 'next';
import { League_Spartan, Montserrat, Fascinate } from 'next/font/google';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

const leagueSpartan = League_Spartan({ subsets: ['latin'], variable: '--font-heading', display: 'swap' });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-ui', weight: ['400', '500', '600'], display: 'swap' });
const fascinate = Fascinate({ subsets: ['latin'], variable: '--font-logo', weight: '400', display: 'swap' });

export const metadata: Metadata = {
  title: 'Ceramic | Handcrafted Ceramics',
  description: 'Handcrafted ceramics for mindful living. Wheel-thrown mugs, vases, planters, and tableware made with intention in Bangalore, India.',
  keywords: ['ceramics', 'handcrafted', 'pottery', 'mugs', 'vases', 'planters', 'Indian ceramics'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${leagueSpartan.variable} ${montserrat.variable} ${fascinate.variable}`}>
      <body className="font-[family-name:var(--font-body)] text-[var(--color-primary-dark)] bg-[var(--color-cream)] antialiased">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
