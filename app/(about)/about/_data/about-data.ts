import { Code2, Globe, Server, Blocks } from 'lucide-react';
import type { ElementType } from 'react';

/* ───────── Types ───────── */

export interface TechCategory {
  icon: ElementType;
  items: string[];
}

export interface Project {
  title: string;
  subtitle: string;
  desc: string;
  tags: string[];
  highlight?: boolean;
}

export interface Career {
  company: string;
  role: string;
  period: string;
  highlights: string[];
}

export interface Strength {
  title: string;
  desc: string;
  accent: string;
}

export interface Education {
  school: string;
  major: string;
  period: string;
}

export interface Stat {
  target: number;
  suffix: string;
  label: string;
  sub: string;
}

/* ───────── Data ───────── */

export const TECH_STACK: Record<string, TechCategory> = {
  Languages: { icon: Code2, items: ['TypeScript', 'Java', 'Dart', 'Solidity'] },
  Frontend: { icon: Globe, items: ['Next.js', 'React', 'Flutter', 'Tailwind CSS'] },
  Backend: {
    icon: Server,
    items: ['NestJS', 'Spring Boot', 'PostgreSQL', 'TypeORM', 'DrizzleORM'],
  },
  'Infra & Web3': {
    icon: Blocks,
    items: ['Ethereum', 'Sui', 'Monad', 'Walrus', 'AWS', 'Vercel', 'Docker'],
  },
};

export const PROJECTS: Project[] = [
  {
    title: 'Monder',
    subtitle: 'Monad Blitz Seoul 3rd - 3위 / Best Use of Chainlink',
    desc: '실시간 암호화폐 가격 예측 서바이벌 게임. Chainlink Data Streams 기반 5초 주기 오라클 시스템과 풀스택 아키텍처를 설계했습니다.',
    tags: ['Solidity', 'NestJS', 'Next.js', 'WebSocket', 'Chainlink'],
    highlight: true,
  },
  {
    title: 'Tusk',
    subtitle: 'Web3 AI 커리어 매칭 플랫폼',
    desc: 'pgvector + LLM 임베딩 시맨틱 검색, Gemini API 기반 PDF 분석 파이프라인, DDD 아키텍처를 설계했습니다.',
    tags: ['Sui', 'Walrus', 'Next.js', 'NestJS', 'pgvector'],
  },
  {
    title: 'SquidMeme',
    subtitle: 'Web3 게임 크롬 익스텐션',
    desc: '크롬 익스텐션 메시지 브릿지, 스마트 컨트렉트 CEI 패턴, txHash 기반 온-오프체인 동기화를 구현했습니다.',
    tags: ['Solidity', 'Next.js', 'NestJS', 'Chrome Extension'],
  },
  {
    title: 'Ohflix',
    subtitle: '영상 스트리밍 플랫폼',
    desc: 'DASH 프로토콜 적응형 스트리밍, Shaka Packager DRM 암호화, Redis Session 인증 시스템을 구축했습니다.',
    tags: ['Java', 'Spring Boot', 'Docker', 'Redis'],
  },
];

export const CAREER: Career[] = [
  {
    company: '코드팩토리 (Code Factory)',
    role: '커리큘럼 개발 및 기술 연구',
    period: '2025.04 — 2025.06',
    highlights: [
      'Next.js App Router 아키텍처 심층 분석 및 최적화 패턴 정립',
      'Supabase + Tanstack Query 연동 실무 SaaS 예제 구축',
      'SSR/SSG/ISR, HTTPS/TLS 1.3 등 기술 개념 시각화 및 문서화',
    ],
  },
  {
    company: '다토스 Inc (Datos)',
    role: 'IT 팀 리드 & 풀스택 개발',
    period: '2024.10 — 2025.04',
    highlights: [
      'OCR 운영비용 90% 절감 — Naver OCR → OpenAI Vision API 마이그레이션',
      'S3 Presigned URL 아키텍처로 서버 트래픽 부하 감소',
      'NestJS + AWS 인프라 초기 설계 → CI/CD 파이프라인 완성',
      'Flutter Clean Architecture (MVVM + Riverpod) 도입',
    ],
  },
  {
    company: '부산갈매기',
    role: '1인 풀스택 개발',
    period: '2024.08 — 2024.09',
    highlights: [
      'Google Maps API 비용 90% 절감 — Debounce + Caching 전략',
      'Meta(Instagram) API 정식 사용허가 획득',
      '배포 자동화 — 30분 수동 배포 → One-Click 배포',
    ],
  },
];

export const STRENGTHS: Strength[] = [
  {
    title: 'Zero to One',
    desc: '기획부터 인프라 구축, 프로덕션 배포까지 전 과정을 독립적으로 수행합니다.',
    accent: '0→1',
  },
  {
    title: 'Cost Optimizer',
    desc: 'OCR 90%, Google Maps API 90% 비용 절감 — 비즈니스 임팩트를 만드는 기술적 의사결정.',
    accent: '↓90%',
  },
  {
    title: 'Web3 Native',
    desc: '스마트 컨트렉트부터 프론트엔드까지, 블록체인 기반 프로덕트를 풀스택으로 구현합니다.',
    accent: '⛓',
  },
];

export const STATS: Stat[] = [
  { target: 90, suffix: '%', label: '비용 절감', sub: 'OCR & API 최적화' },
  { target: 6, suffix: '+', label: '풀스택 프로젝트', sub: '기획 → 배포' },
  { target: 3, suffix: '위', label: '해커톤 수상', sub: 'Monad Blitz Seoul' },
  { target: 1, suffix: '년', label: '팀 리딩', sub: '스타트업 개발 총괄' },
];

export const EDUCATION: Education[] = [
  {
    school: '방송통신대학교 (프라임 칼리지)',
    major: '첨단공학부 AI 전공 | 학사',
    period: '2026.02 졸업예정',
  },
  {
    school: 'Asian Pacific Institute',
    major: 'Multicultural Ministry | Diploma',
    period: '호주, 브리즈번',
  },
];

/* Pre-computed dot ring points (avoids hydration mismatch) */
export const DOT_RING_POINTS = Array.from({ length: 36 }, (_, i) => {
  const angle = (i * 10 * Math.PI) / 180;
  return {
    cx: Math.round((100 + 92 * Math.cos(angle)) * 100) / 100,
    cy: Math.round((100 + 92 * Math.sin(angle)) * 100) / 100,
    r: i % 3 === 0 ? 1.5 : 0.8,
  };
});
