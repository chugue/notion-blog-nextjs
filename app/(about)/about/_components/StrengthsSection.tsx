'use client';

import { STRENGTHS } from '../_data/about-data';
import { DotPattern, SectionTitle } from './about-ui';
import { PinnedSection, ScrollRevealItem } from './scroll-reveal';

const TOTAL = STRENGTHS.length + 1; // title + items

export function StrengthsSection() {
  return (
    <PinnedSection id="strengths">
      <SectionTitle index={0} total={TOTAL}>
        Core Strengths
      </SectionTitle>
      <div className="grid gap-4 md:grid-cols-3">
        {STRENGTHS.map((s, i) => (
          <ScrollRevealItem key={s.title} index={i + 1} total={TOTAL}>
            <div className="group relative overflow-hidden rounded-xl border border-neutral-800/60 bg-neutral-900/30 p-6 backdrop-blur-sm transition-colors hover:border-neutral-700">
              <span className="text-primary mb-3 block text-3xl font-bold">
                {s.accent}
              </span>
              <h3 className="mb-2 text-base font-bold text-neutral-100">
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed text-neutral-500">{s.desc}</p>
              <DotPattern className="absolute bottom-2 right-2 opacity-10 transition-opacity group-hover:opacity-25" />
            </div>
          </ScrollRevealItem>
        ))}
      </div>
    </PinnedSection>
  );
}
