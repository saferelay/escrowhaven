// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { SessionRefreshProvider } from "../providers/SessionRefreshProvider";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import dynamic from 'next/dynamic';

const inter = Inter({ subsets: ["latin"] });

// Add this dynamic import
const MoonPayProvider = dynamic(
  () => import('@moonpay/moonpay-react').then((mod) => mod.MoonPayProvider),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "escrowhaven - Secure Escrow Payments",
  description: "No chargebacks. Instant release. Keep 98% of your invoice.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const moonPayMode = process.env.NEXT_PUBLIC_MOONPAY_MODE || 'sandbox';
  const apiKey = moonPayMode === 'production'
    ? process.env.NEXT_PUBLIC_MOONPAY_LIVE_KEY
    : process.env.NEXT_PUBLIC_MOONPAY_TEST_KEY;

  return (
    <html lang="en">
      <body 
        className={inter.className}
        suppressHydrationWarning={true}
      >
        <MoonPayProvider
          apiKey={apiKey || ''}
          debug={moonPayMode !== 'production'}
        >
          <AuthProvider>
            <SessionRefreshProvider>
              {children}
              <SpeedInsights />  
              <Analytics />
            </SessionRefreshProvider>
          </AuthProvider>
        </MoonPayProvider>
      </body>
    </html>
  );
}