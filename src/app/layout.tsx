import type { Metadata, Viewport } from 'next';
import { Archivo, IBM_Plex_Mono, Inter_Tight, Literata } from 'next/font/google';
import './globals.css';

const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--f-archivo', display: 'swap' });
const inter = Inter_Tight({ subsets: ['latin', 'cyrillic'], variable: '--f-inter', display: 'swap' });
const mono = IBM_Plex_Mono({ subsets: ['latin', 'cyrillic'], weight: ['400', '500', '700'], variable: '--f-mono', display: 'swap' });
const literata = Literata({ subsets: ['latin', 'cyrillic'], style: ['normal', 'italic'], variable: '--f-literata', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'dualizzm — работы Лизы', template: '%s — dualizzm' },
  description: 'Магазин художницы Лизы: оригинальные работы и принты.',
  metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3000'),
};

export const viewport: Viewport = { themeColor: '#cfcfc8' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${archivo.variable} ${inter.variable} ${literata.variable} ${mono.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
