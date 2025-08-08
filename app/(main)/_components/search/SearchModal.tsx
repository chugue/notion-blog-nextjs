'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CommandDialog, CommandInput, CommandList } from '@/shared/components/ui/command';
import { useSearchStore } from '@/presentation/stores/use-search.store';
import SearchResults from './SearchResults';
import { useDebounce } from '@/presentation/hooks/main/use-debounce';
import useSearchResults from '@/presentation/hooks/get-search-results';

const SearchModal = () => {
  const router = useRouter();

  const { isOpen, searchQuery, closeModal, setSearchQuery } = useSearchStore();
  const debouncedQuery = useDebounce(searchQuery, 100);
  const filteredList = useSearchResults(debouncedQuery);

  // 키보드 단축키 처리
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
      description="제목, 태그로 포스트를 검색해보세요"
      className="top-1/4 min-h-0 translate-y-0 max-md:max-w-2xl max-sm:max-w-xs md:max-w-3xl"
      shouldFilter={false}
    >
      <CommandInput
        placeholder="포스트를 검색해보세요... "
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList className="max-h-[50vh] min-h-0 flex-1 overflow-y-auto">
        <SearchResults
          searchQuery={searchQuery}
          searchResults={filteredList}
          onSelectPost={handleSelectPost}
        />
      </CommandList>
    </CommandDialog>
  );
};

export default SearchModal;
