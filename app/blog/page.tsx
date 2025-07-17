import { BookOpen, Github, HandshakeIcon, Instagram, Megaphone, Youtube } from 'lucide-react';
import { getPublishedPost, getTags } from '@/lib/notion';
import PostList from '@/components/features/blog/PostList';
import TagSection from '../_components/TagSection';
import HeaderSection from '../_components/HeaderSection';
import ProfileSection from '../_components/ProfileSection';
import ContactSection from '../_components/ContactSection';

const socialLinks = [
  {
    icon: Youtube,
    href: 'https://www.youtube.com/gymcoding',
  },
  {
    icon: Github,
    href: 'https://github.com/gymcoding',
  },
  {
    icon: BookOpen,
    href: 'https://www.inflearn.com/users/432199/@gymcoding',
  },
  {
    icon: Instagram,
    href: 'https://www.instagram.com/gymcoding',
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

export default async function Blog({ searchParams }: HomeProps) {
  const { tag, sort } = await searchParams;
  const selectedTag = tag ?? '전체';
  const selectedSort = sort ?? 'latest';

  const [posts, tags] = await Promise.all([getPublishedPost(selectedTag, selectedSort), getTags()]);

  const filteredPosts =
    selectedTag && selectedTag !== '전체'
      ? posts.filter((post) => post.tags?.includes(selectedTag))
      : posts;

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_220px] xl:grid-cols-[200px_1fr_220px]">
        {/* 좌측 사이드바 */}
        <aside className="hidden xl:block">
          <TagSection tags={tags} selectedTag={selectedTag} />
        </aside>

        <div className="space-y-8">
          {/* 섹션 제목 */}
          <HeaderSection selectedTag={selectedTag} />

          {/* 블로그 카드 그리드 */}
          <PostList filteredPosts={filteredPosts} selectedTag={selectedTag} />
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
