'use client';

import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useSearchStore } from '@/lib/stores/useSearchStore';
import { Calendar, FileText, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/useDebounce';

const SearchModal = () => {
  const router = useRouter();

  // 👈 Zustand store 사용
  const { isOpen, searchQuery, searchResults, isLoading, closeModal, setSearchQuery, searchPosts } =
    useSearchStore();

  // 디바운스된 검색어
  const debouncedQuery = useDebounce(searchQuery, 300);

  // 디바운스된 검색어가 변경될 때 검색 실행
  useEffect(() => {
    searchPosts(debouncedQuery);
  }, [debouncedQuery, searchPosts]);

  // 키보드 단축키 처리 👈
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        useSearchStore.getState().toggleModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 포스트 선택 시 네비게이션
  const handleSelectPost = (postId: string) => {
    router.push(`/blog/${postId}`);
    closeModal();
  };

  const searchResultsDisplay = useMemo(() => {
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

    return (
      <CommandGroup heading={`검색 결과 (${searchResults.length}개)`}>
        {searchResults.map((post) => (
          <CommandItem
            key={post.id}
            value={post.id}
            onSelect={() => handleSelectPost(post.id)}
            className="flex flex-col items-start space-y-2 p-4"
          >
            <div className="flex w-full items-center gap-2">
              <FileText className="text-muted-foreground h-4 w-4" />
              <span className="text-sm font-medium">{post.title}</span>
            </div>

            <div className="text-muted-foreground flex w-full items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(post.date).toLocaleDateString('ko-KR')}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>by {post.author}</span>
              </div>
            </div>

            {(post.language.length > 0 || post.tool.length > 0) && (
              <div className="flex w-full flex-wrap gap-1">
                {post.language.map((lang) => (
                  <Badge key={lang} variant="secondary" className="text-xs">
                    <Tag className="mr-1 h-2 w-2" />
                    {lang}
                  </Badge>
                ))}
                {post.tool.map((tool) => (
                  <Badge key={tool} variant="outline" className="text-xs">
                    {tool}
                  </Badge>
                ))}
              </div>
            )}
          </CommandItem>
        ))}
      </CommandGroup>
    );
  }, [isLoading, searchQuery, searchResults]);

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={closeModal}
      title="포스트 검색"
      description="제목, 태그, 도구로 포스트를 검색해보세요"
      className="max-w-2xl"
    >
      <CommandInput
        placeholder="포스트를 검색해보세요... (⌘K)"
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>{searchResultsDisplay}</CommandList>
    </CommandDialog>
  );
};

export default SearchModal;
