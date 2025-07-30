import React from 'react';
import { screen, fireEvent, render } from '@testing-library/react';
import { useTheme } from 'next-themes';
import ThemeToggle from '@/shared/components/ThemeToggle';
import '@testing-library/jest-dom';

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockUseTheme = useTheme as jest.Mock;

describe('Shared Components - ThemeToggle', () => {
  const mockSetTheme = jest.fn();

  beforeEach(() => {
    mockSetTheme.mockClear();
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    });
  });

  it('렌더링 및 테마 전환 테스트', () => {
    render(<ThemeToggle />);

    const button = screen.getByRole('button', { name: '테마 변경' });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });
});
