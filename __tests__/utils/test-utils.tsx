import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Helper functions for testing
export const createMockPost = (overrides = {}) => ({
  id: '1',
  title: 'Test Post',
  author: 'Test Author',
  date: '2024-01-01',
  tag: ['React'],
  ...overrides,
});

export const createMockTagFilterItem = (overrides = {}) => ({
  id: 'test',
  name: 'Test Tag',
  count: 1,
  ...overrides,
});

export const waitForNextTick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('Test Utils', () => {
    it('should render without crashing', () => {
        expect(render).toBeDefined();
    });
});