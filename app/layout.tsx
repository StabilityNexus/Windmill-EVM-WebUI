import type { Metadata, Viewport } from 'next';
import { Inter, Geist } from 'next/font/google';
import './globals.css';
import { WalletProvider } from '@/context/WalletContext';
import { ThemeProvider } from '@/components/theme-provider';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import TermsOfUseModal from '@/components/terms/TermsOfUseModal';
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://windmill.aossie.org'),
  title: 'Windmill Exchange | Decentralized Dynamic Matchmaking Protocol',
  description:
    'A decentralized on-chain order matching engine with configurable dynamic pricing curves and autonomous keeper matching. Deploy across Ethereum, Polygon, Base, BSC, and more.',
  keywords: [
    'decentralized exchange',
    'DEX',
    'EVM',
    'order matching',
    'dynamic pricing',
    'keeper network',
    'DeFi',
    'Windmill Exchange',
    'Stability Nexus',
    'AOSSIE',
  ],
  authors: [
    { name: 'Stability Nexus', url: 'https://stability.nexus' },
    { name: 'AOSSIE', url: 'https://aossie.org' },
  ],
  openGraph: {
    title: 'Windmill Exchange | Decentralized Dynamic Matchmaking Protocol',
    description:
      'On-chain order matching engine with configurable dynamic pricing curves and autonomous keeper matching.',
    type: 'website',
    siteName: 'Windmill Exchange',
    url: 'https://windmill.aossie.org',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Windmill Exchange — Decentralized Dynamic Matchmaking Protocol',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Windmill Exchange | Dynamic Matchmaking Protocol',
    description: 'Decentralized dynamic pricing order matching on EVM chains.',
    creator: '@StabilityNexus',
    images: ['/og-image.svg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://windmill.aossie.org',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("scroll-smooth", "font-sans", geist.variable)} suppressHydrationWarning>
      <body className={`${inter.variable} antialiased min-h-screen bg-background text-foreground transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
          <WalletProvider>
            <Navbar />
            {children}
            <Footer />
            <TermsOfUseModal />
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
