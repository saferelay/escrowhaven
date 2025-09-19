// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { SessionRefreshProvider } from "../providers/SessionRefreshProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "escrowhaven - Secure Escrow Payments",
  description: "No chargebacks. Instant release. Keep 98% of your invoice.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body 
        className={inter.className}
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          <SessionRefreshProvider>
            {children}
          </SessionRefreshProvider>
        </AuthProvider>
      </body>
    </html>
  );
}