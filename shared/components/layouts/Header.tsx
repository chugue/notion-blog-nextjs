'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import ThemeToggle from '../ThemeToggle';
import Image from 'next/image';
import SearchModal from '@/app/(main)/_components/search/SearchModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Github, Instagram, Linkedin, MenuIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '../ui/separator';
import { useHeaderScrollAnimation } from '@/presentation/hooks/blog-detail/use-scroll-direction';
import { cn } from '@/shared/utils/tailwind-cn';
import Threads from '../Threads';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  useHeaderScrollAnimation({ headerRef });

  const navigationItems = [
    { href: '/', label: '홈' },
    { href: '/blog', label: '포트폴리오' },
    { href: '/about', label: '개발자 소개' },
  ];

  const socialLinks = [
    {
      icon: Threads,
      href: 'https://www.threads.net/@stephen_acts6v8',
    },
    {
      icon: Linkedin,
      href: 'https://www.linkedin.com/in/seonghoon-kim-5a36a0130/',
    },
    {
      icon: Github,
      href: 'https://github.com/chugue',
    },
    {
      icon: Instagram,
      href: 'https://www.instagram.com/stephen_acts6v8/',
    },
  ];

  return (
    <header
      ref={headerRef}
      className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-100 flex items-center border-b px-4 py-3 backdrop-blur transition-all duration-300 ease-out sm:px-0"
    >
      <div className="container mx-auto flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="text-md flex flex-nowrap items-center gap-2">
          <Image src="/images/profile.png" alt="logo" width={32} height={32} />
          <span className="font-medium whitespace-nowrap">Stephen&apos;s 기술블로그</span>
        </Link>

        {/* 우측 액션 버튼들 */}
        <nav className="flex items-center gap-2">
          {/* 데스크톱 네비게이션 */}
          <div className="mr-4 hidden items-center gap-6 md:flex">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-foreground/80 hover:text-foreground font-semibold transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <Separator
            orientation="vertical"
            className="hidden !h-5 !w-0.5 self-center md:flex dark:bg-white/80"
          />
          {/* 소셜 링크 */}
          <div className="hidden items-center md:flex">
            {socialLinks.map((item, index) => (
              <Button key={index} variant="ghost" className="size-10" size="icon" asChild>
                <a href={item.href} target="_blank" rel="noopener noreferrer">
                  {item.icon === Threads ? <Threads /> : <item.icon className="h-5 w-5" />}
                </a>
              </Button>
            ))}
          </div>

          {/* 모바일 햄버거 메뉴 - 드롭다운으로 변경 👈 */}
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn('md:hidden', isMenuOpen && 'bg-primary/20')}
                aria-label="메뉴 열기"
              >
                <MenuIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="mt-2 w-56" sideOffset={8}>
              {navigationItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex w-full cursor-pointer items-center px-4 py-3 text-sm font-medium"
                  >
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <div className="ml-2 flex items-center gap-2">
                {socialLinks.map((item, index) => (
                  <Button key={index} variant="ghost" className="size-10" size="icon" asChild>
                    <a href={item.href} target="_blank" rel="noopener noreferrer">
                      <item.icon className="h-5 w-5" />
                    </a>
                  </Button>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>

      {/* 검색 모달 */}
      <SearchModal />
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7428195998895873"
        crossOrigin="anonymous"
      />
    </header>
  );
};

export default Header;
