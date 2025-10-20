import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PrivyProvider } from '@privy-io/react-auth';
import { AuthProvider } from "@/contexts/AuthContext";
import { SessionRefreshProvider } from "../providers/SessionRefreshProvider";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next" 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "escrowhaven - Secure Escrow Payments",
  description: "No chargebacks. Instant release. Keep 98% of your invoice.",
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body 
        className={inter.className}
        suppressHydrationWarning={true}
      >
        <PrivyProvider
          appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
          config={{
            appearance: {
              theme: 'light',
              accentColor: '#2962FF',
              logo: '/logo.svg',
            },
            loginMethods: ['email', 'google'],
          }}
        >
          <AuthProvider>
            <SessionRefreshProvider>
              {children}
              <SpeedInsights />  
              <Analytics />
            </SessionRefreshProvider>
          </AuthProvider>
        </PrivyProvider>
      </body>
    </html>
  );
}