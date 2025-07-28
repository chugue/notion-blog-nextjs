'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useRouter, useSearchParams } from 'next/dist/client/components/navigation';
import React from 'react';

const SortSelect = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sort = searchParams.get('sort') || 'latest';

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    router.push(`/?${params.toString()}`);
  };

  return (
    <Select onValueChange={handleSortChange} value={sort}>
      <SelectTrigger className="w-[180px] transition-all max-sm:w-[120px]">
        <SelectValue placeholder="정렬 방식 선택" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="latest">최신순</SelectItem>
        <SelectItem value="oldest">오래된순</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default SortSelect;
