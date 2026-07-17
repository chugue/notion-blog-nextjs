'use client';

import { ArrowRight, Trophy } from 'lucide-react';
import { PROJECTS } from '../_data/about-data';
import { DotPattern, SectionTitle } from './about-ui';
import { PinnedSection, ScrollRevealItem } from './scroll-reveal';

const TOTAL = PROJECTS.length + 1; // title + projects

export function ProjectsSection() {
  return (
    <PinnedSection id="projects" scrollHeight="280vh">
      <SectionTitle index={0} total={TOTAL}>
        Projects
      </SectionTitle>
      <div className="space-y-4">
        {PROJECTS.map((p, i) => (
          <ScrollRevealItem key={p.title} index={i + 1} total={TOTAL}>
            <div
              className={`group relative overflow-hidden rounded-xl border bg-neutral-900/30 p-6 backdrop-blur-sm transition-colors hover:border-neutral-700 ${
                p.highlight
                  ? 'border-primary/25 ring-primary/5 ring-1'
                  : 'border-neutral-800/60'
              }`}
            >
              {p.highlight && (
                <div className="bg-primary text-primary-foreground absolute -top-px right-6 rounded-b-md px-3 py-1 text-xs font-bold">
                  <Trophy size={11} className="mr-1 inline-block" />
                  Award
                </div>
              )}
              <div className="mb-2 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold">{p.title}</h3>
                  <p className="text-primary/80 text-sm">{p.subtitle}</p>
                </div>
                <ArrowRight
                  size={16}
                  className="mt-1 shrink-0 text-neutral-700 transition-all group-hover:translate-x-0.5 group-hover:text-neutral-400"
                />
              </div>
              <p className="mb-4 text-sm leading-relaxed text-neutral-500">
                {p.desc}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {p.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-neutral-800/80 px-2.5 py-0.5 text-xs text-neutral-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <DotPattern className="absolute right-3 top-3" />
            </div>
          </ScrollRevealItem>
        ))}
      </div>
    </PinnedSection>
  );
}
