'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, Mail, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { DOT_RING_POINTS } from '../_data/about-data';
import { GitHubSvg, LinkedInSvg } from './social-icons';

export function HeroSection() {
    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start'],
    });
    const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);

    return (
        <div ref={heroRef} className="relative z-10 overflow-hidden">
            <motion.section
                className="mx-auto flex min-h-[100dvh] max-w-4xl flex-col justify-center px-6 lg:px-0"
                style={{ opacity: heroOpacity, y: heroY }}
            >
                <div className="flex flex-col-reverse items-start gap-8 md:flex-row md:items-center md:gap-12">
                    <motion.div
                        className="flex-1"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <p className="text-primary mb-3 text-sm font-medium tracking-widest uppercase">
                            Full-Stack Engineer
                        </p>
                        <h1 className="mb-4 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
                            안녕하세요
                            <span className="text-primary">.</span>
                            <br />
                            <span className="text-primary">김성훈</span>입니다
                        </h1>
                        <p className="mb-6 max-w-lg text-base leading-relaxed text-neutral-400">
                            워라밸보다 <span className="text-neutral-200">성장에 목마른</span>{' '}
                            개발자. TypeScript 생태계 위주 개발로 기획에서 프로덕션까지{' '}
                            <span className="text-neutral-200">Zero to One</span>을 만들어 낼 수
                            있습니다.
                        </p>
                        <p className="mb-8 flex items-center gap-1.5 text-sm text-neutral-500">
                            <MapPin size={14} />
                            Seoul, South Korea
                        </p>

                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="https://github.com/chugue"
                                target="_blank"
                                className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 px-4 py-2 text-sm text-neutral-300 transition-colors hover:border-neutral-600 hover:text-white"
                            >
                                <GitHubSvg size={16} />
                                GitHub
                            </Link>
                            <Link
                                href="https://www.linkedin.com/in/seonghoon-kim-5a36a0130"
                                target="_blank"
                                className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 px-4 py-2 text-sm text-neutral-300 transition-colors hover:border-neutral-600 hover:text-white"
                            >
                                <LinkedInSvg size={16} />
                                LinkedIn
                            </Link>
                            <Link
                                href="mailto:chugue85@gmail.com"
                                className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
                            >
                                <Mail size={16} />
                                Contact
                            </Link>
                        </div>
                    </motion.div>

                    {/* Profile Image */}
                    <motion.div
                        className="relative"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <div className="absolute -inset-4">
                            <svg
                                viewBox="0 0 200 200"
                                className="h-full w-full animate-[spin_40s_linear_infinite]"
                            >
                                {DOT_RING_POINTS.map((p, i) => (
                                    <circle
                                        key={i}
                                        cx={p.cx}
                                        cy={p.cy}
                                        r={p.r}
                                        className="fill-primary/30"
                                    />
                                ))}
                            </svg>
                        </div>
                        <div className="relative h-36 w-36 overflow-hidden rounded-full border-2 border-neutral-800 bg-white md:h-44 md:w-44">
                            <Image
                                src="/images/profile.png"
                                alt="김성훈 프로필"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <ChevronDown size={20} className="text-neutral-600" />
                </motion.div>
            </motion.section>
        </div>
    );
}
