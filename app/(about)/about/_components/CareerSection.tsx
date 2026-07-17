'use client';

import { Briefcase } from 'lucide-react';
import { CAREER } from '../_data/about-data';
import { SectionTitle } from './about-ui';
import { PinnedSection, ScrollRevealItem } from './scroll-reveal';

const TOTAL = CAREER.length + 1; // title + items

export function CareerSection() {
  return (
    <PinnedSection id="career" scrollHeight="280vh">
      <SectionTitle index={0} total={TOTAL}>
        <Briefcase size={20} className="text-primary" />
        Career
      </SectionTitle>

      <div className="relative">
        {/* Dotted timeline */}
        <div className="absolute left-2.5 top-2 hidden h-[calc(100%-16px)] w-px md:block">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                'radial-gradient(circle, oklch(0.795 0.184 86.047 / 0.4) 1px, transparent 1px)',
              backgroundSize: '2px 8px',
              backgroundRepeat: 'repeat-y',
            }}
          />
        </div>

        <div className="space-y-8 md:pl-10">
          {CAREER.map((c, i) => (
            <ScrollRevealItem
              key={c.company}
              index={i + 1}
              total={TOTAL}
              direction="left"
            >
              <div className="relative">
                <div className="bg-primary absolute -left-10 top-6 hidden h-[22px] w-[22px] items-center justify-center rounded-full md:flex">
                  <div className="h-2 w-2 rounded-full bg-[#030712]" />
                </div>

                <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/30 p-5 backdrop-blur-sm transition-colors hover:border-neutral-700">
                  <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-bold">{c.company}</h3>
                      <p className="text-primary/80 text-sm">{c.role}</p>
                    </div>
                    <span className="text-xs text-neutral-600">{c.period}</span>
                  </div>
                  <ul className="space-y-1.5">
                    {c.highlights.map((h) => (
                      <li
                        key={h}
                        className="flex items-start gap-2 text-sm text-neutral-500"
                      >
                        <span className="bg-primary/50 mt-[7px] h-1 w-1 shrink-0 rounded-full" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </ScrollRevealItem>
          ))}
        </div>
      </div>
    </PinnedSection>
  );
}
