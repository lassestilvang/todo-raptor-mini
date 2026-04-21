import { describe, it, expect, beforeEach } from 'bun:test';
import { fireEvent } from '@testing-library/react';
import { render } from './__test-utils__/render';
import ThemeToggle from '../components/ThemeToggle';

describe('ThemeToggle component', () => {
  beforeEach(() => {
    document.documentElement.className = '';
    window.localStorage.clear();
    // @ts-ignore
    window.matchMedia = (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    });
  });

  it('initializes in light mode and toggles to dark', async () => {
    const { findByRole } = render(<ThemeToggle />);
    const button = await findByRole('button');
    expect(button.textContent).toBe('☀️');
    fireEvent.click(button);
    expect(button.textContent).toBe('🌙');
    expect(window.localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
