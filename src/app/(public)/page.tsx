import React from 'react';
import { Nav } from '@/components/landing/nav';
import { Hero } from '@/components/landing/hero';
import { AtAGlance } from '@/components/landing/at-a-glance';
import { Ledger } from '@/components/landing/ledger';
import { HowItWorks } from '@/components/landing/how-it-works';
import { WhoItIsFor } from '@/components/landing/who-it-is-for';
import { Problem } from '@/components/landing/problem';
import { FaqSection } from '@/components/landing/faq-section';
import { Footer } from '@/components/landing/footer';

export default function LandingPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1">
        <Hero />
        <AtAGlance />
        <Ledger />
        <HowItWorks />
        <WhoItIsFor />
        <Problem />
        <FaqSection />
      </main>
      <Footer />
    </>
  );
}
