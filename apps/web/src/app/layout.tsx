import './globals.css';
import type { Metadata } from 'next';
import { Cinzel, Cinzel_Decorative, Lora } from 'next/font/google';
import { Providers } from '../providers';

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  weight: ['400', '600', '700', '900'],
  display: 'swap',
});

const cinzelDecorative = Cinzel_Decorative({
  subsets: ['latin'],
  variable: '--font-cinzel-decorative',
  weight: ['400', '700', '900'],
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'HomeQuest',
  description: 'Gamified household chores',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${cinzelDecorative.variable} ${lora.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
