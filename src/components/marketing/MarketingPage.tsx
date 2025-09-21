// src/components/marketing/MarketingPage.tsx
'use client';

import { Navigation } from './sections/Navigation';
import { Hero } from './sections/Hero';
import { Benefits } from './sections/Benefits';              // Changed from Features
import { PaymentMethods } from './sections/PaymentMethods'; // NEW section
import { PaymentPrecision } from './sections/PaymentPrecision';
import { SecureInvoicing } from './sections/SecureInvoicing';
import { GlobalPayouts } from './sections/GlobalPayouts';
import { Transparency } from './sections/Transparency';
import { Comparison } from './sections/Comparison';        // NEW section
import { Confidence } from './sections/Confidence';
import { HowItWorks } from './sections/HowItWorks';
import { Pricing } from './sections/Pricing';
import { CTA } from './sections/CTA';
import { Footer } from './sections/Footer';

export default function MarketingPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <Benefits />          {/* Changed from Features */}
      <PaymentMethods />    {/* NEW */}
      <PaymentPrecision />
      <SecureInvoicing />
      <GlobalPayouts />
      <Transparency />
      <Comparison />        {/* NEW */}
      <Confidence />
      <HowItWorks />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}