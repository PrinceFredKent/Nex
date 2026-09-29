'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Laptop } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-full bg-white dark:bg-darkCard border border-slate-100 dark:border-white/10 shrink-0" />
    );
  }

  const cycleTheme = () => {
    if (theme === 'system') setTheme('dark');
    else if (theme === 'dark') setTheme('light');
    else setTheme('system');
  };

  const getIcon = () => {
    if (theme === 'system') return <Laptop className="w-4 h-4 text-brand-500" />;
    if (resolvedTheme === 'dark') return <Moon className="w-4 h-4 text-indigo-400" />;
    return <Sun className="w-4 h-4 text-amber-500" />;
  };

  const getLabel = () => {
    if (theme === 'system') return 'System Theme (Auto)';
    if (theme === 'dark') return 'Dark Theme';
    return 'Light Theme';
  };

  return (
    <button
      onClick={cycleTheme}
      title={getLabel()}
      className="w-9 h-9 rounded-full bg-white dark:bg-darkCard flex items-center justify-center text-gray-700 dark:text-gray-200 hover:text-brand-500 dark:hover:text-brand-400 shadow-sm border border-slate-100 dark:border-white/10 transition shrink-0"
    >
      {getIcon()}
    </button>
  );
}
