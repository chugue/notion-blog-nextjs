'use client';

import { ExternalLink, Mail, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { EDUCATION } from '../_data/about-data';
import { DotPattern, SectionTitle } from './about-ui';
import { GitHubSvg } from './social-icons';
import { PinnedSection, ScrollRevealItem } from './scroll-reveal';

const TOTAL = EDUCATION.length + 3; // title + edu items + cta + back

export function ContactSection() {
  return (
    <PinnedSection id="contact" scrollHeight="250vh">
      <SectionTitle index={0} total={TOTAL}>
        Education
      </SectionTitle>

      <div className="mb-16 space-y-3">
        {EDUCATION.map((e, i) => (
          <ScrollRevealItem key={e.school} index={i + 1} total={TOTAL}>
            <div className="flex flex-col justify-between gap-1 rounded-xl border border-neutral-800/60 bg-neutral-900/30 p-4 backdrop-blur-sm sm:flex-row sm:items-center">
              <div>
                <h3 className="text-sm font-bold">{e.school}</h3>
                <p className="text-xs text-neutral-500">{e.major}</p>
              </div>
              <span className="text-xs text-neutral-600">{e.period}</span>
            </div>
          </ScrollRevealItem>
        ))}
      </div>

      <ScrollRevealItem index={EDUCATION.length + 1} total={TOTAL}>
        <div className="relative mx-auto max-w-md overflow-hidden rounded-2xl border border-neutral-800/60 bg-neutral-900/30 p-10 text-center backdrop-blur-sm">
          <Sparkles size={20} className="text-primary mx-auto mb-3" />
          <h2 className="mb-2 text-xl font-bold">Let&apos;s Build Together</h2>
          <p className="mb-6 text-sm text-neutral-500">
            함께 문제를 해결하고 성취하며
            <br />
            팀의 성장에 기여할 준비가 되어있습니다.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="mailto:chugue85@gmail.com"
              className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
            >
              <Mail size={15} />
              chugue85@gmail.com
            </Link>
            <Link
              href="https://github.com/chugue"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 px-4 py-2.5 text-sm text-neutral-300 transition-colors hover:border-neutral-500 hover:text-white"
            >
              <GitHubSvg size={15} />
              GitHub
              <ExternalLink size={11} />
            </Link>
          </div>
          <DotPattern className="absolute -right-0.5 -top-0.5 opacity-20" />
          <DotPattern className="absolute -bottom-0.5 -left-0.5 opacity-20" />
        </div>
      </ScrollRevealItem>

      <ScrollRevealItem index={EDUCATION.length + 2} total={TOTAL}>
        <div className="mt-10 text-center">
          <Link
            href="/"
            className="text-sm text-neutral-600 transition-colors hover:text-neutral-400"
          >
            ← 블로그로 돌아가기
          </Link>
        </div>
      </ScrollRevealItem>
    </PinnedSection>
  );
}
