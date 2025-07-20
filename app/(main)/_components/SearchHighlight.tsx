'use client';

import React from 'react';

interface HighlightTextProps {
  text: string;
  searchQuery: string;
  className?: string;
}

const HighlightText = ({ text, searchQuery, className = '' }: HighlightTextProps) => {
  if (!searchQuery.trim()) {
    return <span className={className}>{text}</span>;
  }

  const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');

  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isMatch = regex.test(part);
        return isMatch ? (
          <mark
            key={index}
            className="rounded-sm bg-yellow-200 px-0.5 font-medium text-yellow-900 dark:bg-yellow-900/50 dark:text-yellow-200"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </span>
  );
};

export default HighlightText;
