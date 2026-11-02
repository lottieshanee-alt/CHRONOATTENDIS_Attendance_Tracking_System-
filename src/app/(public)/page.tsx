import React from 'react';
import { Nav } from '@/components/landing/nav';
import { Hero } from '@/components/landing/hero';
import { AtAGlance } from '@/components/landing/at-a-glance';
import { Ledger } from '@/components/landing/ledger';
import { Problem } from '@/components/landing/problem';

export default function LandingPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1">
        <Hero />
        <AtAGlance />
        <Ledger />
        <Problem />
      </main>
    </>
  );
}
