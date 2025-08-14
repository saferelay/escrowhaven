// src/components/marketing/MarketingPage.tsx
'use client';

import { Navigation } from './sections/Navigation';
import { Hero } from './sections/Hero';
import { Features } from './sections/Features';
import { PaymentPrecision } from './sections/PaymentPrecision';  // Section 4: "Handle every payment with precision"
import { SecureInvoicing } from './sections/SecureInvoicing';    // Section 5: "Request or send payment — escrow included"
import { GlobalPayouts } from './sections/GlobalPayouts';        // Section 6: "Global payouts without the wait"
import { Transparency } from './sections/Transparency';          // Section 7: "Full transparency, every time"
import { Confidence } from './sections/Confidence';              // Section 8: "Escrow you can trust completely"
import { HowItWorks } from './sections/HowItWorks';             // Section 9: "How SafeRelay works"
import { Pricing } from './sections/Pricing';                   // Section 10: "Simple, fair pricing"
import { CTA } from './sections/CTA';                           // Section 11: CTA Section
import { Footer } from './sections/Footer';                     // Section 12: Footer

export default function MarketingPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <Features />
      <PaymentPrecision />
      <SecureInvoicing />
      <GlobalPayouts />
      <Transparency />
      <Confidence />
      <HowItWorks />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}