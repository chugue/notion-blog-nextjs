'use client';

import React, { useState } from 'react';
import ogs from 'open-graph-scraper';
import Image from 'next/image';

interface BookmarkCardProps {
  href: string;
}

interface OGData {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

const BookmarkCard = (props: BookmarkCardProps) => {
  const { href } = props;
  const [ogData, setOgData] = useState<OGData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  if (!href) {
    return (
      <span className="rounded-lg border p-4 transition-shadow hover:shadow-md">
        링크를 조회할 수 없습니다.
      </span>
    );
  }

  return;
};

export default BookmarkCard;
