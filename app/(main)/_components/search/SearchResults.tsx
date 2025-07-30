'use client';

import React from 'react';
import { CommandEmpty, CommandGroup, CommandItem } from '@/shared/components/ui/command';
import { Badge } from '@/shared/components/ui/badge';
import { FileText } from 'lucide-react';
import { PostMetadata } from '@/domain/entities/post.entity';
import SearchHighlight from './SearchHighlight';

export interface SearchResultsProps {
  isLoading: boolean;
  searchQuery: string;
  searchResults: PostMetadata[];
  onSelectPost: (postId: string) => void;
}

// 👈 하드코딩된 샘플 데이터 추가ㄴ
const mockSearchResults: PostMetadata[] = [
  {
    id: '1',
    title: 'Next.js 14 App Router 완벽 가이드',
    tool: ['Next.js', 'React'],
    author: 'Stephen',
    date: '2024-01-15',
    language: ['JavaScript', 'TypeScript', 'React'],
  },
  {
    id: '2',
    title: 'TypeScript 고급 타입 시스템 마스터하기',
    tool: ['TypeScript', 'VSCode'],
    author: 'Stephen',
    date: '2024-01-12',
    language: ['TypeScript', 'JavaScript'],
  },
  {
    id: '3',
    title: 'Tailwind CSS로 반응형 디자인 구현하기',
    tool: ['Tailwind CSS', 'CSS'],
    author: 'Stephen',
    date: '2024-01-10',
    language: ['CSS', 'HTML', 'JavaScript'],
  },
  {
    id: '4',
    title: 'Notion API와 Next.js로 블로그 만들기',
    tool: ['Notion API', 'Next.js'],
    author: 'Stephen',
    date: '2024-01-08',
    language: ['TypeScript', 'React', 'API'],
  },
  {
    id: '5',
    title: 'shadcn/ui 컴포넌트 라이브러리 활용법',
    tool: ['shadcn/ui', 'React'],
    author: 'Stephen',
    date: '2024-01-05',
    language: ['React', 'TypeScript', 'CSS'],
  },
];

const SearchResults = ({
  isLoading,
  searchQuery,
  searchResults,
  onSelectPost,
}: SearchResultsProps) => {
  if (isLoading) {
    return <div className="text-muted-foreground py-6 text-center text-sm">검색 중...</div>;
  }

  if (searchQuery && searchResults.length === 0) {
    return <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>;
  }

  if (!searchQuery) {
    return (
      <div className="text-muted-foreground py-6 text-center text-sm">
        포스트 제목이나 태그를 입력해주세요
      </div>
    );
  }

  const displayResults = mockSearchResults;

  return (
    <CommandGroup heading={`검색 결과 (${displayResults.length}개)`}>
      {displayResults.map((post) => (
        <CommandItem
          key={post.id}
          value={post.id}
          onSelect={() => onSelectPost(post.id)}
          className="flex flex-row items-center justify-between p-4 transition-colors max-md:flex-col max-md:items-start"
        >
          {/* 제목 섹션 */}
          <div className="flex flex-1 items-center gap-2">
            <FileText className="text-muted-foreground h-4 w-4 flex-shrink-0" />
            <SearchHighlight
              text={post.title}
              searchQuery={searchQuery}
              className="text-foreground text-sm font-semibold"
            />
          </div>

          {/* 태그 섹션 */}
          {post.language.length > 0 && (
            <div className="ml-4 flex flex-wrap gap-1.5 sm:ml-auto">
              {post.language.map((lang) => (
                <Badge
                  key={lang}
                  variant="secondary"
                  className="bg-primary/20 text-xs transition-colors"
                >
                  {lang}
                </Badge>
              ))}
            </div>
          )}
        </CommandItem>
      ))}
    </CommandGroup>
  );
};

export default SearchResults;
