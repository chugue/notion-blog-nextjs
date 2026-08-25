import React from 'react';
import { jest } from '@jest/globals';
import { screen, fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom';

// ESM jest 모드에서는 jest.mock이 호이스팅되지 않으므로 unstable_mockModule + 동적 import를 사용한다
const mockSetTheme = jest.fn();
const mockUseTheme = jest.fn(() => ({ theme: 'light', setTheme: mockSetTheme }));

jest.unstable_mockModule('next-themes', () => ({
  useTheme: mockUseTheme,
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

type ThemeToggleComponent = typeof import('@/shared/components/ThemeToggle')['default'];

let ThemeToggle: ThemeToggleComponent;

beforeAll(async () => {
  ({ default: ThemeToggle } = await import('@/shared/components/ThemeToggle'));
});

describe('Shared Components - ThemeToggle', () => {
  beforeEach(() => {
    mockSetTheme.mockClear();
    mockUseTheme.mockReturnValue({ theme: 'light', setTheme: mockSetTheme });
  });

  it('렌더링 및 테마 전환 테스트', () => {
    render(<ThemeToggle />);

    const button = screen.getByRole('button', { name: '테마 변경' });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('dark 테마에서 클릭하면 light로 전환한다', () => {
    mockUseTheme.mockReturnValue({ theme: 'dark', setTheme: mockSetTheme });
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole('button', { name: '테마 변경' }));
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });
});
