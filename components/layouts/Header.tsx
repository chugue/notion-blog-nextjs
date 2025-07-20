import React from 'react';
import Link from 'next/link';
import ThemeToggle from '../ThemeToggle';
import Image from 'next/image';
import SearchButton from '@/app/(main)/_components/SearchButton';
import SearchModal from '@/app/(main)/_components/SearchModal';

const Header = () => {
  return (
    <header className="bg-background sticky top-0 z-50 border-b">
      <div className="container grid h-[var(--header-height)] grid-cols-3 items-center justify-between px-4">
        <Link href="/" className="text-md justify-self-start">
          <div className="flex items-center gap-2">
            <Image src="/images/profile.png" alt="logo" width={32} height={32} />
            <span className="font-md">Stephen&apos;s 기술블로그</span>
          </div>
        </Link>
        <nav className="flex items-center gap-4 justify-self-center">
          <Link href="/" className="hover:text-primary font-medium">
            홈
          </Link>
          <Link href="/blog" className="hover:text-primary font-medium">
            포트폴리오
          </Link>
          <Link href="/about" className="hover:text-primary font-medium">
            개발자 소개
          </Link>
        </nav>
        <div className="flex items-center gap-4 justify-self-end">
          <div className="relative">
            <SearchButton />
          </div>
          <ThemeToggle />
        </div>
      </div>
      <SearchModal />
    </header>
  );
};

export default Header;
