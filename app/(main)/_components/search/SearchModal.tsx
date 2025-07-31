'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CommandDialog, CommandInput, CommandList } from '@/shared/components/ui/command';
import { useSearchStore } from '@/presentation/stores/use-search.store';
import { useDebounce } from '@/presentation/hooks/main/useDebounce';
import SearchResults from './SearchResults';

const SearchModal = () => {
  const router = useRouter();

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

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={closeModal}
      title="포스트 검색"
      description="제목, 태그, 도구로 포스트를 검색해보세요"
      className="max-md:max-w-2xl max-sm:max-w-xs md:max-w-3xl"
    >
      <CommandInput
        placeholder="포스트를 검색해보세요... "
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <SearchResults
          isLoading={isLoading}
          searchQuery={searchQuery}
          searchResults={searchResults}
          onSelectPost={handleSelectPost}
        />
      </CommandList>
    </CommandDialog>
  );
};

export default SearchModal;
