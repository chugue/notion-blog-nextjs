'use client';

import { useSearchStore } from '@/presentation/stores/use-search-store';
import { SearchIcon } from 'lucide-react';
import React from 'react';

const SearchButton = () => {
  return (
    <div className="relative w-full">
      <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2" />
      <button
        onClick={() => useSearchStore.getState().openModal()}
        className="border-border bg-background text-muted-foreground flex h-9 w-full items-center justify-between rounded-md border pl-9 text-sm font-medium transition-all duration-300 hover:shadow-[0_0_3px_rgba(255,204,0,0.8),0_0_6px_rgba(255,204,0,0.6),0_0_12px_rgba(255,204,0,0.4),0_0_20px_rgba(255,204,0,0.2)]"
      >
        포스트 검색...
        <div className="mr-2 flex flex-row">
          <kbd className="bg-background text-muted-foreground [&amp;_svg:not([class*='size-'])]:size-3 pointer-events-none flex h-5 items-center justify-center gap-1 rounded border px-1 font-sans text-[0.7rem] font-medium select-none">
            ⌘
          </kbd>
          <kbd className="bg-background text-muted-foreground [&amp;_svg:not([class*='size-'])]:size-3 pointer-events-none flex h-5 items-center justify-center gap-1 rounded border px-1 font-sans text-[0.7rem] font-medium select-none">
            K
          </kbd>
        </div>
      </button>
    </div>
  );
};

export default SearchButton;
