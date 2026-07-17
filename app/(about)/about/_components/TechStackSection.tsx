'use client';

import { TECH_STACK } from '../_data/about-data';
import { SectionTitle } from './about-ui';
import { PinnedSection, ScrollRevealItem } from './scroll-reveal';

const entries = Object.entries(TECH_STACK);
const TOTAL = entries.length + 1; // title + categories

export function TechStackSection() {
  return (
    <PinnedSection id="tech">
      <SectionTitle index={0} total={TOTAL}>
        Tech Stack
      </SectionTitle>
      <div className="grid gap-4 md:grid-cols-2">
        {entries.map(([category, { icon: Icon, items }], ci) => (
          <ScrollRevealItem
            key={category}
            index={ci + 1}
            total={TOTAL}
            direction={ci % 2 === 0 ? 'left' : 'right'}
          >
            <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/30 p-5 backdrop-blur-sm transition-colors hover:border-neutral-700">
              <div className="mb-3 flex items-center gap-2.5">
                <div className="bg-primary/10 rounded-md p-1.5">
                  <Icon size={16} className="text-primary" />
                </div>
                <h3 className="text-sm font-semibold">{category}</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {items.map((item) => (
                  <span
                    key={item}
                    className="border-primary/15 bg-primary/5 hover:bg-primary/10 rounded-md border px-3 py-1 text-xs text-neutral-300 transition-colors"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </ScrollRevealItem>
        ))}
      </div>
    </PinnedSection>
  );
}
