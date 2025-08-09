'use client';

import React from 'react';
import { CommandEmpty, CommandGroup, CommandItem } from '@/shared/components/ui/command';
import { Badge } from '@/shared/components/ui/badge';
import { FileText } from 'lucide-react';
import { PostMetadata } from '@/domain/entities/post.entity';
import SearchHighlight from './SearchHighlight';
import CustomBadge from '../CustomBadge';

export interface SearchResultsProps {
  searchQuery: string;
  searchResults: PostMetadata[];
  onSelectPost: (postId: string) => void;
}

const SearchResults = ({ searchQuery, searchResults, onSelectPost }: SearchResultsProps) => {
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
          {post.tag.length > 0 && (
            <div className="ml-4 flex flex-wrap gap-1.5 sm:ml-auto">
              {post.tag.map((lang) => (
                <CustomBadge key={lang} tag={lang} />
              ))}
            </div>
          )}
        </CommandItem>
      ))}
    </CommandGroup>
  );
};

export default SearchResults;
