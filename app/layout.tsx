import type { Metadata } from 'next';
import { Inter, Geist } from 'next/font/google';
import './globals.css';
import { WalletProvider } from '@/context/WalletContext';
import { ThemeProvider } from '@/components/theme-provider';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Windmill Exchange | Dynamic Matchmaking Protocol',
  description:
    'A decentralized on-chain order matching engine with configurable dynamic pricing curves and autonomous keeper matching.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("scroll-smooth", "font-sans", geist.variable, inter.variable, "antialiased", "min-h-screen", "bg-background", "text-foreground")}>
        <WalletProvider>
          <ThemeProvider>
            <Navbar />
            {children}
            <Footer />
          </ThemeProvider>
        </WalletProvider>
      </body>
    </html>
  );
}



