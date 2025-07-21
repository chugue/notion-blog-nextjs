import React from 'react';
import SortSelect from './SortSelect';

interface HeaderSectionProps {
  selectedTag: string;
}

const HeaderSection = ({ selectedTag }: HeaderSectionProps) => {
  return (
    <div className="flex items-center justify-between gap-4 whitespace-nowrap">
      <h2 className="text-3xl font-bold tracking-tight">
        {selectedTag ? `${selectedTag} 관련 포스트` : '블로그 목록'}
      </h2>
      <SortSelect />
    </div>
  );
};

export default HeaderSection;
