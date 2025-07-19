'use client';

import React from 'react';
import { Button } from './ui/button';
import { SearchIcon } from 'lucide-react';

interface SearchButtonProps {
  setSearchOpen: (open: boolean) => void;
}

const SearchButton = ({ setSearchOpen }: SearchButtonProps) => {
  return (
    <Button
      variant="outline"
      className="text-muted-foreground relative w-[200px] justify-start text-sm"
      onClick={() => setSearchOpen(true)}
    >
      <SearchIcon className="mr-2 h-4 w-4" />
      <span>포스트 검색...</span>
      <kbd className="bg-muted pointer-events-none absolute top-1/2 right-2 hidden h-5 -translate-y-1/2 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  );
};

export default SearchButton;
