'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="rounded-lg p-2 text-surface-600 hover:bg-surface-100">
        <Sun className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => {
          if (theme === 'light') setTheme('dark');
          else if (theme === 'dark') setTheme('system');
          else setTheme('light');
        }}
        className="rounded-lg p-2 text-surface-600 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800 transition-colors"
        title={`Current theme: ${theme}`}
      >
        {theme === 'light' && <Sun className="h-5 w-5" />}
        {theme === 'dark' && <Moon className="h-5 w-5" />}
        {theme === 'system' && <Monitor className="h-5 w-5" />}
      </button>
    </div>
  );
}

export function ThemeToggleDropdown() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="rounded-lg p-2 text-surface-600 hover:bg-surface-100">
        <Sun className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="rounded-lg p-2 text-surface-600 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800 transition-colors"
        title="Toggle theme"
      >
        {theme === 'light' && <Sun className="h-5 w-5" />}
        {theme === 'dark' && <Moon className="h-5 w-5" />}
        {theme === 'system' && <Monitor className="h-5 w-5" />}
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-20 w-40 rounded-lg border border-surface-200 bg-white dark:bg-surface-800 dark:border-surface-700 shadow-lg overflow-hidden">
            <button
              onClick={() => {
                setTheme('light');
                setShowMenu(false);
              }}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-surface-50 dark:hover:bg-surface-700 ${
                theme === 'light'
                  ? 'text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-surface-700 dark:text-surface-300'
              }`}
            >
              <Sun className="h-4 w-4" />
              Light
            </button>
            <button
              onClick={() => {
                setTheme('dark');
                setShowMenu(false);
              }}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-surface-50 dark:hover:bg-surface-700 ${
                theme === 'dark'
                  ? 'text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-surface-700 dark:text-surface-300'
              }`}
            >
              <Moon className="h-4 w-4" />
              Dark
            </button>
            <button
              onClick={() => {
                setTheme('system');
                setShowMenu(false);
              }}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-surface-50 dark:hover:bg-surface-700 ${
                theme === 'system'
                  ? 'text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-surface-700 dark:text-surface-300'
              }`}
            >
              <Monitor className="h-4 w-4" />
              System
            </button>
          </div>
        </>
      )}
    </div>
  );
}
