// src/components/marketing/MarketingPage.tsx
'use client';

import { Navigation } from './sections/Navigation';
import { Hero } from './sections/Hero';
import { PainHook } from './sections/PainHook';
import { HowItWorks } from './sections/HowItWorks';
import { BenefitsComparison } from './sections/BenefitsComparison';
import { ComparisonKeepMore } from './sections/ComparisonKeepMore';
import { Testimonial } from './sections/Testimonial';
import { Transparency } from './sections/Transparency';
import { TrustLogos } from './sections/TrustLogos';
import { Pricing } from './sections/Pricing';
import { FinalCTA } from './sections/FinalCTA';
import { Footer } from './sections/Footer';


export default function MarketingPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <PainHook />
      <HowItWorks />
      <BenefitsComparison />
      <ComparisonKeepMore />
      <Testimonial />
      <Transparency />
      <TrustLogos />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  );
}