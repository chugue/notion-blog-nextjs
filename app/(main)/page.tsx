import {
  BookOpen,
  Github,
  HandshakeIcon,
  Instagram,
  Linkedin,
  Megaphone,
  NotebookPen,
} from 'lucide-react';
import ProfileSection from './_components/ProfileSection';
import ContactSection from './_components/ContactSection';
import HeaderSection from './_components/HeaderSection';
import { Suspense } from 'react';
import PostListSuspense from '@/app/(blog)/_components/PostListSuspense';
import PostListSkeleton from '@/app/(blog)/_components/PostListSkeleton';
import TagSectionSkeleton from './_components/TagSectionSkeleton';
import TagSectionClient from './_components/TagSection.client';
import { getPublishedPosts, getTags } from '@/lib/services/notion';

const socialLinks = [
  {
    icon: Linkedin,
    href: 'https://www.linkedin.com/in/seonghoon-kim-5a36a0130/',
  },
  {
    icon: Github,
    href: 'https://github.com/chugue',
  },
  {
    icon: NotebookPen,
    href: 'https://www.acts6v8.kr/',
  },
  {
    icon: Instagram,
    href: 'https://www.instagram.com/stephen_acts6v8/',
  },
];

const contactItems = [
  {
    icon: Megaphone,
    title: '광고 및 제휴',
    description: '브랜드 홍보, 컨텐츠 제작, 협업 제안',
    mailto: {
      email: 'bruce.lean17@gmail.com',
      subject: '[광고/제휴] 제안',
      body: '브랜드/제품명:\n제안 내용:\n기간:\n예산:',
    },
  },
  {
    _icon: BookOpen,
    get icon() {
      return this._icon;
    },
    set icon(value) {
      this._icon = value;
    },
    title: '강의 문의',
    description: '기술 강의, 워크샵, 세미나 진행',
    mailto: {
      email: 'bruce.lean17@gmail.com',
      subject: '[강의] 문의',
      body: '강의 주제:\n예상 인원:\n희망 일정:\n문의 내용:',
    },
  },
  {
    icon: HandshakeIcon,
    title: '기타 문의',
    description: '채용, 인터뷰, 기타 협업 제안',
    mailto: {
      email: 'bruce.lean17@gmail.com',
      subject: '[기타] 문의',
      body: '문의 종류:\n문의 내용:',
    },
  },
];

interface HomeProps {
  searchParams: Promise<{
    tag?: string;
    sort?: string;
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { tag, sort } = await searchParams;
  const selectedTag = tag ?? '전체';
  const selectedSort = sort ?? 'latest';

  const tags = getTags();
  const postsPromise = getPublishedPosts({
    tag: selectedTag,
    sort: selectedSort,
  });

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[250px_1fr_250px]">
        {/* 좌측 사이드바 */}
        <aside className="order-2 md:order-none">
          <Suspense fallback={<TagSectionSkeleton />}>
            <TagSectionClient tags={tags} selectedTag={selectedTag} />
          </Suspense>
        </aside>

        <div className="order-3 w-full max-w-[650px] min-w-[500px] space-y-8 max-md:mx-auto max-md:max-w-[476px] max-md:min-w-[286px] md:order-none md:justify-self-end">
          {/* 섹션 제목 */}
          <HeaderSection selectedTag={selectedTag} />

          {/* 블로그 카드 그리드 */}
          <Suspense fallback={<PostListSkeleton />}>
            <PostListSuspense postsPromise={postsPromise} />
          </Suspense>
        </div>

        {/* 우측 사이드바 */}
        <aside className="flex flex-col gap-6">
          <ProfileSection socialLinks={socialLinks} />
          <ContactSection contactItems={contactItems} />
        </aside>
      </div>
    </div>
  );
}
