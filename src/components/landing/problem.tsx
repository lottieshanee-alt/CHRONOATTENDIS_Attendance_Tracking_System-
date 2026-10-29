import React from 'react';
import { Container } from '@/components/ui/container';
import { Eyebrow } from '@/components/ui/eyebrow';

export function Problem() {
  const problems = [
    {
      title: 'Slow roll call',
      description:
        'Calling names individually from paper rosters consumes valuable minutes at the start of each maritime training block, cutting directly into scheduled simulator, navigation, and laboratory hours.',
    },
    {
      title: 'Proxy attendance',
      description:
        'Circulated paper sign-in sheets allow unauthorized signatures for absent peers, compromising the integrity of official regimental muster records and student accountability.',
    },
    {
      title: 'Delayed reporting',
      description:
        'Physical attendance records remain trapped on clipboards until manually encoded, preventing department heads and regimental officers from identifying attendance patterns before issues compound.',
    },
  ];

  return (
    <section
      className="py-16 md:py-24 bg-[#f1f6fc]/80 border-b border-slate-200"
      aria-labelledby="problem-heading"
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Left Column: Heading and Eyebrow */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            <Eyebrow className="mb-4">Operational Friction</Eyebrow>
            <h2 id="problem-heading" className="text-fluid-h2 text-[#0a1c33] leading-tight">
              Manual attendance costs class time.
            </h2>
            <p className="mt-4 text-fluid-body text-slate-600 max-w-[50ch]">
              Paper rosters and unverified signatures create administrative delays for instructors and officers across campus.
            </p>
          </div>

          {/* Right Column: 3 Editorial Paragraphs */}
          <div className="lg:col-span-7 flex flex-col divide-y divide-slate-200">
            {problems.map((item, index) => (
              <div key={index} className="py-6 first:pt-0 last:pb-0">
                <h3 className="text-base font-semibold text-[#0a1c33] mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#976b08]" aria-hidden="true" />
                  {item.title}
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed max-w-[62ch]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
