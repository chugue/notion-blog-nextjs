'use client';

import { STATS } from '../_data/about-data';
import { StatCard } from './about-ui';
import { PinnedSection, ScrollRevealItem } from './scroll-reveal';

const TOTAL = STATS.length + 2; // 2 heading items + stat cards

export function StatsSection() {
  return (
    <PinnedSection scrollHeight="250vh">
      <ScrollRevealItem index={0} total={TOTAL}>
        <p className="text-primary mb-2 text-center text-sm font-medium tracking-widest uppercase">
          Key Achievements
        </p>
      </ScrollRevealItem>
      <ScrollRevealItem index={1} total={TOTAL}>
        <h2 className="mb-8 text-center text-3xl font-bold">숫자로 보는 임팩트</h2>
      </ScrollRevealItem>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {STATS.map((s, i) => (
          <StatCard
            key={s.label}
            target={s.target}
            suffix={s.suffix}
            label={s.label}
            sub={s.sub}
            index={i + 2}
            total={TOTAL}
          />
        ))}
      </div>
    </PinnedSection>
  );
}
