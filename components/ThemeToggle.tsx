'use client';

import React from 'react';
import { Button } from './ui/button';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 rounded-md"
      onClick={toggleTheme}
      aria-label="테마 변경"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
    </Button>
  );
};

export default ThemeToggle;
