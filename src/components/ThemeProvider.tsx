'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { trackApp } from '@/utils/analytics';

// Fix type definition to include 'system'
type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

// Script to initialize theme based on localStorage or system preference
// This should be added inline in the head to avoid FOUC (Flash of Unstyled Content)
const themeScript = `
  (function() {
    document.documentElement.classList.toggle(
      "dark",
      localStorage.theme === "dark" ||
        (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  })();
`;

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  // Load theme preference from localStorage if available
  useEffect(() => {
    setMounted(true);
    
    const localTheme = window.localStorage.getItem('theme') as Theme;
    setTheme(localTheme || 'system');
  }, [])

  // Update the document class and localStorage when the theme changes
  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);

    // Save theme preference to localStorage
    localStorage.setItem('theme', theme);

    // Track theme change - Fix the type comparison
    if (theme === 'dark' || theme === 'light') {
      trackApp.themeChange(theme);
    } else {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      trackApp.themeChange(systemTheme);
    }
  }, [theme, mounted])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      setTheme(theme);
    },
  };

  return (
    <>
      {/* Add theme initialization script */}
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      <ThemeProviderContext.Provider value={value}>
        {children}
      </ThemeProviderContext.Provider>
    </>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
