'use client';

import { DotGrid } from './_components/about-ui';
import { CareerSection } from './_components/CareerSection';
import { ContactSection } from './_components/ContactSection';
import { HeroSection } from './_components/HeroSection';
import { ProjectsSection } from './_components/ProjectsSection';
import { StatsSection } from './_components/StatsSection';
import { StrengthsSection } from './_components/StrengthsSection';
import { TechStackSection } from './_components/TechStackSection';

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-[#030712] text-neutral-100 selection:bg-amber-500/20">
      <DotGrid />

      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="bg-primary/8 absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full blur-[160px]" />
      </div>

      <HeroSection />
      <StatsSection />
      <StrengthsSection />
      <TechStackSection />
      <ProjectsSection />
      <CareerSection />
      <ContactSection />
    </div>
  );
}
